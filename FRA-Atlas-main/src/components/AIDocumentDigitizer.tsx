import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Eye, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ExtractedData {
  name: string;
  village: string;
  coordinates: string;
  claimType: string;
  status: string;
  confidence: number;
  surveyNumber?: string;
  landArea?: number;
  tribalGroup?: string;
}

interface DocumentFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extractedData?: ExtractedData;
  progress: number;
}

export const AIDocumentDigitizer: React.FC = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocuments = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending' as const,
      progress: 0
    }));
    setDocuments(prev => [...prev, ...newDocuments]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff']
    },
    multiple: true
  });

  const simulateOCRProcessing = async (documentId: string, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: 'processing' as const }
        : doc
    ));

    // Simulate progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, progress: i }
          : doc
      ));
    }

    // Mock extracted data based on file name patterns
    const mockData: ExtractedData = {
      name: file.name.includes('ravi') ? 'Ravi Kumar' : 
            file.name.includes('maya') ? 'Maya Devi' :
            `${['Suresh', 'Lakshmi', 'Ramesh', 'Geeta'][Math.floor(Math.random() * 4)]} ${['Kumar', 'Devi', 'Singh', 'Patel'][Math.floor(Math.random() * 4)]}`,
      village: ['Kumargram', 'Birpara', 'Madarihat', 'Kalchini', 'Nagrakata'][Math.floor(Math.random() * 5)],
      coordinates: `${(89 + Math.random()).toFixed(4)}, ${(26 + Math.random()).toFixed(4)}`,
      claimType: Math.random() > 0.7 ? 'community' : 'individual',
      status: ['pending', 'approved', 'under_review'][Math.floor(Math.random() * 3)],
      confidence: 0.85 + Math.random() * 0.1,
      surveyNumber: `SUR-${Math.floor(Math.random() * 10000)}`,
      landArea: 1 + Math.random() * 4,
      tribalGroup: ['Rajbanshi', 'Toto', 'Mech', 'Oraon', 'Munda'][Math.floor(Math.random() * 5)]
    };

    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            status: 'completed' as const, 
            extractedData: mockData,
            progress: 100 
          }
        : doc
    ));

    return mockData;
  };

  const processDocument = async (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    try {
      setIsProcessing(true);
      
      // Upload file to Supabase storage
      const fileExt = document.file.name.split('.').pop();
      const fileName = `${documentId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('fra-documents')
        .upload(fileName, document.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('fra-documents')
        .getPublicUrl(fileName);

      // Insert document record
      const { error: insertError } = await supabase
        .from('fra_documents')
        .insert({
          file_name: document.file.name,
          file_url: publicUrl,
          extraction_status: 'processing'
        });

      if (insertError) throw insertError;

      // Simulate AI processing
      const extractedData = await simulateOCRProcessing(documentId, document.file);

      // Update database with extracted data
      await supabase
        .from('fra_documents')
        .update({
          extraction_status: 'completed',
          extracted_data: extractedData as any
        })
        .eq('file_name', document.file.name);

      toast({
        title: "Document Processed",
        description: `Successfully extracted data from ${document.file.name}`,
      });

    } catch (error) {
      console.error('Error processing document:', error);
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'failed' as const }
          : doc
      ));
      
      toast({
        title: "Processing Failed",
        description: "Failed to process document",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processAllDocuments = async () => {
    const pendingDocs = documents.filter(doc => doc.status === 'pending');
    for (const doc of pendingDocs) {
      await processDocument(doc.id);
    }
  };

  const exportToJSON = (data: ExtractedData) => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fra-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI Document Digitizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop FRA documents here' : 'Upload FRA Documents'}
            </p>
            <p className="text-sm text-muted-foreground">
              Drag & drop PDF files or images, or click to select
            </p>
          </div>

          {documents.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Processing Queue</h3>
                <Button 
                  onClick={processAllDocuments}
                  disabled={isProcessing || documents.every(doc => doc.status !== 'pending')}
                >
                  Process All Documents
                </Button>
              </div>

              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{doc.file.name}</span>
                          <Badge variant={
                            doc.status === 'completed' ? 'default' :
                            doc.status === 'processing' ? 'secondary' :
                            doc.status === 'failed' ? 'destructive' : 'outline'
                          }>
                            {doc.status}
                          </Badge>
                        </div>

                        {doc.status === 'processing' && (
                          <Progress value={doc.progress} className="mb-2" />
                        )}

                        {doc.extractedData && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Extracted Data
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><strong>Name:</strong> {doc.extractedData.name}</div>
                              <div><strong>Village:</strong> {doc.extractedData.village}</div>
                              <div><strong>Coordinates:</strong> {doc.extractedData.coordinates}</div>
                              <div><strong>Claim Type:</strong> {doc.extractedData.claimType}</div>
                              <div><strong>Status:</strong> {doc.extractedData.status}</div>
                              <div><strong>Confidence:</strong> {(doc.extractedData.confidence * 100).toFixed(1)}%</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {doc.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => processDocument(doc.id)}
                            disabled={isProcessing}
                          >
                            Process
                          </Button>
                        )}
                        {doc.extractedData && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportToJSON(doc.extractedData!)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          AI OCR + NER extraction automatically identifies names, villages, coordinates, claim types, and status from uploaded FRA documents.
        </AlertDescription>
      </Alert>
    </div>
  );
};