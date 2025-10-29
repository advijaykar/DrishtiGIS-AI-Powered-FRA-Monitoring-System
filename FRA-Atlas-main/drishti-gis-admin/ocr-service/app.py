import uvicorn
import tempfile
import os
import re
import logging
from pathlib import Path
from typing import Optional, Dict, Any
from PIL import Image, ImageEnhance, ImageFilter

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Optional imports for OCR and NER
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Drishti-GIS OCR Service",
    description="OCR and Named Entity Recognition service for Forest Rights Act documents",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response models
class OCRResponse(BaseModel):
    success: bool
    claim_id: Optional[str] = None
    claimant_name: Optional[str] = None
    claim_type: Optional[str] = None
    village: Optional[str] = None
    area: Optional[float] = None
    confidence: float
    raw_text: Optional[str] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    tesseract_available: bool
    spacy_available: bool
    version: str

# Load spaCy model if available
nlp = None
if SPACY_AVAILABLE:
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        logger.warning("spaCy English model not found. Install with: python -m spacy download en_core_web_sm")
        SPACY_AVAILABLE = False

def preprocess_image(image: Image.Image) -> Image.Image:
    """Preprocess image for better OCR results"""
    try:
        # Convert to grayscale
        if image.mode != 'L':
            image = image.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(2.0)
        
        # Apply slight Gaussian blur to reduce noise
        image = image.filter(ImageFilter.GaussianBlur(0.5))
        
        # Resize if too small
        width, height = image.size
        if width < 800 or height < 800:
            scale = max(800 / width, 800 / height)
            new_size = (int(width * scale), int(height * scale))
            image = image.resize(new_size, Image.LANCZOS)
        
        return image
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        return image

def extract_text_from_image(image: Image.Image) -> str:
    """Extract text from image using Tesseract OCR"""
    if not TESSERACT_AVAILABLE:
        return "OCR service not available - Tesseract not installed"
    
    try:
        # Configure Tesseract
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz /-().'
        
        # Extract text
        text = pytesseract.image_to_string(image, config=custom_config, lang='eng')
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text: {e}")
        return f"OCR extraction failed: {str(e)}"

def extract_entities_with_regex(text: str) -> Dict[str, Any]:
    """Extract entities using regex patterns (fallback method)"""
    entities = {
        'claim_id': None,
        'claimant_name': None,
        'claim_type': None,
        'village': None,
        'area': None,
        'confidence': 0.5  # Lower confidence for regex-based extraction
    }
    
    try:
        # Clean text
        text = ' '.join(text.split())
        text_upper = text.upper()
        
        # Extract claim ID patterns
        claim_id_patterns = [
            r'\b([A-Z]{2}-[A-Z]{3}-\d{3}-\d{4})\b',  # CG-KDG-001-2024
            r'\b([A-Z]{2}/\d{4}/\d+)\b',              # CG/2024/001
            r'\bCLAIM\s*(?:ID|NO|NUMBER)?\s*:?\s*([A-Z0-9\-/]+)\b'
        ]
        
        for pattern in claim_id_patterns:
            match = re.search(pattern, text_upper)
            if match:
                entities['claim_id'] = match.group(1)
                break
        
        # Extract claimant name
        name_patterns = [
            r'\b(?:NAME|CLAIMANT)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
            r'\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b(?=.*(?:CLAIM|FOREST|RIGHT))'
        ]
        
        for pattern in name_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                name = match.group(1).strip()
                if len(name.split()) >= 2 and not any(word in name.upper() for word in ['FOREST', 'RIGHTS', 'CLAIM', 'VILLAGE']):
                    entities['claimant_name'] = name
                    break
            if entities['claimant_name']:
                break
        
        # Extract claim type
        if 'INDIVIDUAL FOREST RIGHT' in text_upper or 'IFR' in text_upper:
            entities['claim_type'] = 'IFR'
        elif 'COMMUNITY FOREST RIGHT' in text_upper or 'CFR' in text_upper:
            entities['claim_type'] = 'CFR'
        elif 'COMMUNITY RIGHT' in text_upper or ' CR ' in text_upper:
            entities['claim_type'] = 'CR'
        
        # Extract village name
        village_patterns = [
            r'\b(?:VILLAGE|GRAM)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)\b',
            r'\b([A-Z][a-z]+)\s+VILLAGE\b'
        ]
        
        for pattern in village_patterns:
            match = re.search(pattern, text)
            if match:
                village = match.group(1).strip()
                if len(village) > 2:
                    entities['village'] = village
                    break
        
        # Extract area
        area_patterns = [
            r'\b(\d+\.?\d*)\s*(?:HECTARE|HA|ACRE)\b',
            r'\bAREA\s*:?\s*(\d+\.?\d*)\b'
        ]
        
        for pattern in area_patterns:
            match = re.search(pattern, text_upper)
            if match:
                try:
                    area_value = float(match.group(1))
                    # Convert acres to hectares if needed
                    if 'ACRE' in pattern:
                        area_value = area_value * 0.4047  # Convert acres to hectares
                    entities['area'] = round(area_value, 2)
                    break
                except ValueError:
                    continue
        
        # Calculate confidence based on extracted entities
        found_entities = sum(1 for v in entities.values() if v is not None and v != 0.5)
        entities['confidence'] = min(0.4 + (found_entities * 0.15), 0.9)
        
    except Exception as e:
        logger.error(f"Error in regex extraction: {e}")
        entities['confidence'] = 0.1
    
    return entities

def extract_entities_with_spacy(text: str) -> Dict[str, Any]:
    """Extract entities using spaCy NLP (enhanced method)"""
    if not SPACY_AVAILABLE or nlp is None:
        return extract_entities_with_regex(text)
    
    try:
        # Start with regex results as baseline
        entities = extract_entities_with_regex(text)
        
        # Process with spaCy
        doc = nlp(text)
        
        # Look for person names if not already found
        if not entities['claimant_name']:
            for ent in doc.ents:
                if ent.label_ == "PERSON" and len(ent.text.split()) >= 2:
                    entities['claimant_name'] = ent.text
                    break
        
        # Look for location names for village if not found
        if not entities['village']:
            for ent in doc.ents:
                if ent.label_ in ["GPE", "LOC"] and len(ent.text.split()) <= 3:
                    # Check if it's likely a village name
                    if not any(word in ent.text.upper() for word in ['INDIA', 'STATE', 'DISTRICT', 'COUNTRY']):
                        entities['village'] = ent.text
                        break
        
        # Boost confidence if spaCy found additional entities
        if entities['claimant_name'] or entities['village']:
            entities['confidence'] = min(entities['confidence'] + 0.2, 0.95)
        
    except Exception as e:
        logger.error(f"Error in spaCy extraction: {e}")
    
    return entities

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        tesseract_available=TESSERACT_AVAILABLE,
        spacy_available=SPACY_AVAILABLE,
        version="1.0.0"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    return HealthResponse(
        status="healthy",
        tesseract_available=TESSERACT_AVAILABLE,
        spacy_available=SPACY_AVAILABLE,
        version="1.0.0"
    )

@app.post("/ocr", response_model=OCRResponse)
async def process_document(file: UploadFile = File(...)):
    """Process uploaded document with OCR and NER"""
    
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file type
    if not file.content_type or not file.content_type.startswith(('image/', 'application/pdf')):
        raise HTTPException(status_code=400, detail="Only image and PDF files are supported")
    
    temp_file = None
    try:
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_file = tmp.name
        
        # Handle PDF files (basic support)
        if file.content_type == 'application/pdf':
            return OCRResponse(
                success=False,
                confidence=0.0,
                error="PDF processing not implemented in this version. Please convert to image format.",
                raw_text=None
            )
        
        # Process image
        try:
            image = Image.open(temp_file)
            
            # Preprocess image
            processed_image = preprocess_image(image)
            
            # Extract text using OCR
            raw_text = extract_text_from_image(processed_image)
            
            if not raw_text or raw_text.strip() == "":
                return OCRResponse(
                    success=False,
                    confidence=0.0,
                    error="No text could be extracted from the image",
                    raw_text=""
                )
            
            # Extract structured information using NER
            entities = extract_entities_with_spacy(raw_text)
            
            # Generate fallback claim ID if none found
            if not entities['claim_id']:
                entities['claim_id'] = f"TEMP-{hash(raw_text[:50]) % 100000:05d}"
            
            # Generate fallback name if none found
            if not entities['claimant_name']:
                entities['claimant_name'] = "Name Not Found"
                entities['confidence'] = max(entities['confidence'] - 0.3, 0.1)
            
            return OCRResponse(
                success=True,
                claim_id=entities['claim_id'],
                claimant_name=entities['claimant_name'],
                claim_type=entities['claim_type'],
                village=entities['village'],
                area=entities['area'],
                confidence=entities['confidence'],
                raw_text=raw_text[:500] + "..." if len(raw_text) > 500 else raw_text
            )
            
        except Exception as img_error:
            logger.error(f"Image processing error: {img_error}")
            return OCRResponse(
                success=False,
                confidence=0.0,
                error=f"Image processing failed: {str(img_error)}",
                raw_text=None
            )
    
    except Exception as e:
        logger.error(f"OCR processing error: {e}")
        return OCRResponse(
            success=False,
            confidence=0.0,
            error=f"Processing failed: {str(e)}",
            raw_text=None
        )
    
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file):
            try:
                os.unlink(temp_file)
            except Exception as cleanup_error:
                logger.warning(f"Failed to cleanup temp file: {cleanup_error}")

@app.post("/ocr/batch")
async def process_batch_documents(files: list[UploadFile] = File(...)):
    """Process multiple documents in batch"""
    if len(files) > 10:  # Limit batch size
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed in batch")
    
    results = []
    for file in files:
        try:
            result = await process_document(file)
            results.append({
                "filename": file.filename,
                "result": result
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "result": OCRResponse(
                    success=False,
                    confidence=0.0,
                    error=str(e),
                    raw_text=None
                )
            })
    
    return {"results": results}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
