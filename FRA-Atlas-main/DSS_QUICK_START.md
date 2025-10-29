# DSS Engine - Quick Start Guide 🚀

## 🎯 What is the DSS Engine?

The **Decision Support Engine** analyzes Forest Rights Act (FRA) patta holders and recommends eligible government schemes based on:
- 🌾 Land area
- 💧 Water access
- 🏠 Housing status
- 💰 Income level
- 👨‍👩‍👧‍👦 Household size

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Run Database Setup
```powershell
.\setup_dss_data.ps1
```

### Step 2: Start Application
```bash
npm run dev
```

### Step 3: Access DSS Engine
Navigate to: `http://localhost:5173/aranyx`

---

## 📊 Dummy Data Overview

### 19+ Patta Holders from 7 States

| State | Beneficiaries | Example |
|-------|--------------|---------|
| **Odisha** | 3 | Dharani Majhi (1.2 ha), Baidhar Sabar (8.5 ha) |
| **Chhattisgarh** | 3 | Somaru Baiga (3.5 ha), Phoolmati Gond (12.3 ha) |
| **Jharkhand** | 2 | Sushila Ho (4.2 ha), Birsa Santhal (0.8 ha) |
| **Maharashtra** | 2 | Vitthal Bhil (2.1 ha), Savita Warli (6.7 ha) |
| **Rajasthan** | 2 | Kaluram Meena (5.8 ha), Geeta Saharia (1.3 ha) |
| **Assam** | 2 | Krishna Bodo (1.5 ha), Purnima Rabha (2.3 ha) |
| **West Bengal** | 5 | Ravi Kumar, Maya Devi, Lakshmi Oraon, etc. |

### 18+ Government Schemes

| Scheme | Benefit | Eligibility |
|--------|---------|-------------|
| **PM-KISAN** | ₹6,000/year | Land ≤ 2 ha |
| **Jal Jeevan Mission** | Piped water | No water access |
| **MGNREGA** | 100 days work | Rural household |
| **PMAY-G** | Housing aid | Homeless/BPL |
| **Swachh Bharat** | Toilet aid | No toilet |
| **Van Dhan Vikas** | Forest produce | Tribal area |
| **PM Fasal Bima** | Crop insurance | Any farmer |
| **Kisan Credit Card** | Credit ₹3L @ 7% | Land owner |
| **PM Matsya Sampada** | Fish farming | Has water body |
| **PM Krishi Sinchayee** | Irrigation | Land > 0.5 ha |

### 50+ Assets Detected
- 🌾 Farmland
- 💧 Water bodies
- 🏡 Homesteads
- 🌳 Forest patches
- 🐟 Ponds

---

## 🎮 How to Use

### 1. Select Beneficiary
```
Dropdown → "Select Patta Holder for Analysis"
Choose: Dharani Majhi - Similiguda (1.2 ha)
```

### 2. View Profile
```
✅ Name: Dharani Majhi
✅ Land: 1.2 hectares
✅ Location: Similiguda, Koraput, Odisha
✅ Household: 4 members
✅ Water Access: ❌ No
✅ Toilet: ✅ Yes
✅ Poverty Status: Below poverty line
```

### 3. Analyze Eligibility
```
Click: "Analyze Eligibility" button
Wait: 2-3 seconds for AI analysis
```

### 4. Review Results
```
✅ ELIGIBLE SCHEMES:
   • PM-KISAN (95% confidence) - ₹6,000/year
   • MGNREGA (88% confidence) - 100 days work
   • Jal Jeevan Mission (92% confidence) - Water connection

❌ NOT ELIGIBLE:
   • Swachh Bharat (has toilet)
```

---

## 🧪 Test Scenarios

### Scenario 1: Small Farmer (PM-KISAN)
```
Select: Dharani Majhi (1.2 ha)
Expected: ✅ PM-KISAN, ✅ MGNREGA
Reason: Small landholding ≤ 2 hectares
```

### Scenario 2: Forest-Rich Area (Van Dhan)
```
Select: Somaru Baiga (3.5 ha, Baiga tribe)
Expected: ✅ Van Dhan Vikas
Reason: Tribal area with forest resources
```

### Scenario 3: Water Access Needed
```
Select: Kaluram Meena (5.8 ha, Rajasthan)
Expected: ✅ Jal Jeevan Mission, ✅ PM Krishi Sinchayee
Reason: Arid area needing water infrastructure
```

### Scenario 4: Fishery Development
```
Select: Sushila Ho (4.2 ha, has pond)
Expected: ✅ PM Matsya Sampada Yojana
Reason: Pond asset detected (0.4 ha)
```

---

## 🔍 Eligibility Rules Summary

### PM-KISAN
```
IF land_area <= 2 hectares
THEN eligible
CONFIDENCE: 95%
```

### Jal Jeevan Mission
```
IF has_water_access == false
THEN eligible
CONFIDENCE: 92%
```

### MGNREGA
```
IF rural_household == true
THEN eligible
CONFIDENCE: 88%
```

### PMAY-G
```
IF is_homeless OR is_below_poverty_line
THEN eligible
CONFIDENCE: 90%
```

### Swachh Bharat Mission
```
IF has_toilet == false
THEN eligible
CONFIDENCE: 94%
```

---

## 📈 Confidence Score Interpretation

| Score | Meaning | Action |
|-------|---------|--------|
| **90-100%** | 🟢 High confidence | Apply immediately |
| **80-89%** | 🟡 Medium confidence | Verify eligibility first |
| **< 80%** | 🔴 Low confidence | May not qualify |

---

## 🎨 Priority Levels

- 🔴 **HIGH** - Urgent need, high confidence (>90%)
- 🟡 **MEDIUM** - Moderate need, good confidence (80-90%)
- ⚪ **LOW** - Not eligible or low confidence (<80%)

---

## 🗂️ Database Tables

```sql
-- View all patta holders
SELECT * FROM pattas;

-- View active schemes
SELECT * FROM schemes WHERE is_active = true;

-- View recommendations
SELECT p.holder_name, s.name, sr.confidence_score
FROM scheme_recommendations sr
JOIN pattas p ON sr.patta_id = p.id
JOIN schemes s ON sr.scheme_id = s.id;

-- View assets
SELECT p.holder_name, a.asset_type, a.area
FROM assets a
JOIN pattas p ON a.patta_id = p.id;
```

---

## 🐛 Troubleshooting

### Problem: No pattas in dropdown
```sql
-- Check if data exists
SELECT COUNT(*) FROM pattas WHERE status = 'approved';
```
**Solution**: Run `setup_dss_data.ps1`

### Problem: No schemes showing
```sql
-- Check schemes
SELECT COUNT(*) FROM schemes WHERE is_active = true;
```
**Solution**: Re-run migration `add_dss_sample_data.sql`

### Problem: Analysis fails
- ✅ Check browser console (F12)
- ✅ Verify Supabase connection
- ✅ Check network tab for errors

---

## 🔧 Configuration Files

### Environment Variables (`.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Database Migrations
```
supabase/migrations/
├── 20250908034447_*.sql        # Schema creation
├── add_dss_sample_data.sql     # 19+ pattas, 18+ schemes
└── add_user_profiles.sql       # User profiles
```

### Component File
```
src/components/DecisionSupportEngine.tsx
```

---

## 📊 Sample Data Statistics

```
✅ 19+ Patta Holders
✅ 18+ Government Schemes
✅ 50+ AI-Detected Assets
✅ 12+ Scheme Recommendations
✅ 6+ Community Feedback Entries
✅ 7 States Covered
✅ 15+ Tribal Groups
```

---

## 🎯 Key Features

### 1. Beneficiary Profile Analysis
- Land ownership details
- Asset inventory (farmland, water bodies, forests)
- Household demographics
- Infrastructure status (water, toilet, housing)

### 2. Scheme Matching
- Rule-based eligibility engine
- Confidence scoring (0-100%)
- Priority assignment
- Benefit amount estimation

### 3. Detailed Recommendations
- ✅ Eligible schemes with reasons
- ❌ Ineligible schemes with explanations
- 📊 Confidence percentages
- 💰 Estimated benefits
- 📅 Application deadlines

### 4. Eligibility Breakdown
- Criteria-by-criteria analysis
- Current vs. required values
- Visual indicators (✅/❌)
- Threshold comparisons

---

## 🚀 Next Steps

1. **Setup Database**
   ```powershell
   .\setup_dss_data.ps1
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open DSS Engine**
   ```
   http://localhost:5173/aranyx
   ```

4. **Test with Different Beneficiaries**
   - Small farmers (< 2 ha)
   - Large landholders (> 5 ha)
   - Forest-rich areas
   - Water-poor regions

5. **Customize Rules**
   - Edit `DecisionSupportEngine.tsx`
   - Add new schemes to database
   - Modify eligibility criteria

---

## 📚 Documentation

📖 **Full Guide**: `DSS_ENGINE_SETUP_GUIDE.md`  
🔧 **Component Code**: `src/components/DecisionSupportEngine.tsx`  
🗄️ **Database Schema**: `supabase/migrations/`  
⚙️ **Setup Script**: `setup_dss_data.ps1`

---

## 🎓 Sample Workflow

```
1. User Opens DSS Page (/aranyx)
   ↓
2. Dropdown Shows: "Dharani Majhi - Similiguda (1.2 ha)"
   ↓
3. Profile Loads:
   - Land: 1.2 ha
   - Household: 4 members
   - Water: No
   - Toilet: Yes
   ↓
4. User Clicks: "Analyze Eligibility"
   ↓
5. AI Analyzes Against 18+ Schemes
   ↓
6. Results Display:
   ✅ PM-KISAN (95%) - ₹6,000/year
   ✅ MGNREGA (88%) - 100 days work
   ✅ Jal Jeevan (92%) - Water connection
   ❌ Swachh Bharat (has toilet)
   ↓
7. User Reviews Details:
   - Eligibility criteria met
   - Estimated benefits
   - Application process
   ↓
8. Recommendations Saved to Database
```

---

## 🎉 You're Ready!

Your DSS Engine is now configured with comprehensive dummy data. Start testing with different beneficiaries and see the intelligent recommendations in action!

**For detailed information, see**: `DSS_ENGINE_SETUP_GUIDE.md`

---

**Team AranyaX** | **SIH 2025** | **Ministry of Tribal Affairs (MoTA)**
