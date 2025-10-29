# Decision Support Engine (DSS) - Setup Guide

## Overview
The Decision Support Engine is a rule-based recommendation system that analyzes Forest Rights Act (FRA) patta holder profiles to suggest eligible government schemes like PM-KISAN, Jal Jeevan Mission, MGNREGA, PMAY-G, and Swachh Bharat Mission.

## Features
✅ **AI-Powered Analysis**: Analyzes land size, water access, housing status, income level, and household data  
✅ **Scheme Recommendations**: Suggests eligible schemes with confidence scores  
✅ **Eligibility Checks**: Shows detailed eligibility criteria and verification  
✅ **Priority Rating**: High/Medium/Low priority based on urgency and confidence  
✅ **Beneficiary Profiles**: Complete profile view with assets and demographics  

---

## Database Schema

### Key Tables

#### 1. **pattas** - Land Rights Holders
```sql
- id: UUID
- holder_name: TEXT
- village: TEXT
- district: TEXT
- state: TEXT
- tribal_group: TEXT
- claim_type: 'individual' | 'community'
- land_area: DECIMAL (in hectares)
- coordinates: POINT
- status: 'pending' | 'approved' | 'rejected'
- survey_number: TEXT
```

#### 2. **schemes** - Government Schemes
```sql
- id: UUID
- name: TEXT
- description: TEXT
- eligibility_criteria: JSONB
- benefits: TEXT
- department: TEXT
- is_active: BOOLEAN
```

#### 3. **scheme_recommendations** - DSS Recommendations
```sql
- id: UUID
- patta_id: UUID (references pattas)
- scheme_id: UUID (references schemes)
- recommendation_reason: TEXT
- confidence_score: DECIMAL(3,2) [0-1]
- status: 'pending' | 'accepted' | 'rejected'
```

#### 4. **assets** - AI-Detected Land Features
```sql
- id: UUID
- patta_id: UUID
- asset_type: 'farmland' | 'water_body' | 'homestead' | 'forest' | 'pond'
- coordinates: POINT
- area: DECIMAL
- confidence_score: DECIMAL(3,2)
- verified_by_user: BOOLEAN
```

---

## Dummy Data Included

### Sample Patta Holders (19+)
The database includes diverse beneficiaries from 7 different states:

**Odisha**
- Dharani Majhi (Kondh, 1.2 ha) - Small farmer
- Baidhar Sabar (Sabar, 8.5 ha) - Community forest
- Kumari Paraja (Paraja, 2.8 ha) - Pending status

**Chhattisgarh**
- Somaru Baiga (Baiga, 3.5 ha) - Van Dhan candidate
- Phoolmati Gond (Gond, 12.3 ha) - Large community holding
- Ramesh Korwa (Korwa, 1.9 ha) - Marginal farmer

**Jharkhand**
- Birsa Santhal (Santhal, 0.8 ha) - Rejected claim
- Sushila Ho (Ho, 4.2 ha) - Has pond for fisheries

**Maharashtra**
- Vitthal Bhil (Bhil, 2.1 ha) - Drought-prone area
- Savita Warli (Warli, 6.7 ha) - Community land

**Rajasthan**
- Kaluram Meena (Meena, 5.8 ha) - Arid agriculture
- Geeta Saharia (Saharia, 1.3 ha) - Pending status

**Assam**
- Krishna Bodo (Bodo, 1.5 ha) - Tea garden worker
- Purnima Rabha (Rabha, 2.3 ha) - Small holder

### Government Schemes (18+)
- **PM-KISAN** - Direct cash support for small farmers
- **Jal Jeevan Mission** - Piped water supply
- **MGNREGA** - Employment guarantee (100 days)
- **PMAY-G** - Rural housing assistance
- **Swachh Bharat Mission** - Toilet construction
- **Van Dhan Vikas** - Tribal forest produce value addition
- **PM Fasal Bima Yojana** - Crop insurance
- **Kisan Credit Card** - Agricultural credit
- **National Horticulture Mission** - Horticulture development
- **Pradhan Mantri Matsya Sampada Yojana** - Fisheries development
- **Soil Health Card Scheme** - Soil testing
- **Pradhan Mantri Krishi Sinchayee Yojana** - Irrigation development
- **National Rural Livelihood Mission** - Skill development
- **Forest Rights Act Implementation** - Community forest rights
- **Digital India - CSC** - Digital service access
- **Pradhan Mantri Ujjwala Yojana** - Clean cooking fuel
- **Ayushman Bharat - PMJAY** - Health insurance (₹5 lakh coverage)

### Assets & Verification
- **50+ AI-detected assets** including farmland, water bodies, forests, ponds, homesteads
- Confidence scores ranging from 0.87 to 0.97
- Mix of verified and unverified assets

### Community Feedback
- Asset verification reports
- Photo uploads of land conditions
- Status updates on scheme implementation
- Crop damage reports and compensation needs

---

## Setup Instructions

### Method 1: Using PowerShell Script (Recommended)

```powershell
# Run the automated setup script
.\setup_dss_data.ps1
```

This will:
1. Check for Supabase CLI
2. Run database migrations
3. Insert all sample data
4. Create indexes and materialized views
5. Set up RLS policies

### Method 2: Manual Setup via Supabase Dashboard

1. **Login to Supabase Dashboard**
   - Navigate to https://supabase.com
   - Select your project

2. **Run SQL Migrations**
   - Go to SQL Editor
   - Copy and paste the following files in order:
     - `supabase/migrations/20250908034447_276272df-27ce-4694-943f-d0bda1e32ab9.sql`
     - `supabase/migrations/add_dss_sample_data.sql`
     - `supabase/migrations/add_user_profiles.sql`

3. **Execute Each SQL File**
   - Click "Run" for each file
   - Wait for success confirmation

### Method 3: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Push migrations to database
supabase db push --file "supabase/migrations/add_dss_sample_data.sql"
supabase db push --file "supabase/migrations/add_user_profiles.sql"
```

---

## How the DSS Engine Works

### Eligibility Analysis Rules

#### PM-KISAN
```javascript
Eligible if: land_area <= 2 hectares
Confidence: 0.95
Benefit: ₹6,000/year
```

#### Jal Jeevan Mission
```javascript
Eligible if: has_water_access === false
Confidence: 0.92
Benefit: Piped water connection
```

#### MGNREGA
```javascript
Eligible if: rural_area === true AND household_members >= 1
Confidence: 0.88
Benefit: 100 days guaranteed employment
```

#### PMAY-G (Housing)
```javascript
Eligible if: is_homeless === true OR is_below_poverty_line === true
Confidence: 0.90
Benefit: Housing construction assistance
```

#### Swachh Bharat Mission
```javascript
Eligible if: has_toilet === false
Confidence: 0.94
Benefit: Toilet construction support
```

### Decision Algorithm Flow

```
1. User selects Patta Holder
   ↓
2. Fetch beneficiary profile (land, assets, demographics)
   ↓
3. Fetch active government schemes
   ↓
4. For each scheme:
   - Check eligibility criteria
   - Calculate confidence score
   - Generate recommendation reason
   - Assign priority (high/medium/low)
   ↓
5. Sort by eligibility + confidence
   ↓
6. Save recommendations to database
   ↓
7. Display results with:
   - Eligibility status (Eligible/Not Eligible)
   - Confidence percentage
   - Estimated benefit amount
   - Application deadline
   - Priority indicator
```

---

## Using the DSS Engine

### Step 1: Access DSS Page
Navigate to: `http://localhost:5173/aranyx` (or your deployment URL)

### Step 2: Select Patta Holder
1. Click the dropdown: "Select Patta Holder for Analysis"
2. Choose from available approved patta holders
3. Profile details will load automatically

### Step 3: Analyze Eligibility
1. Click "Analyze Eligibility" button
2. Wait for AI analysis (2-3 seconds)
3. View results in three sections:
   - **Beneficiary Profile**: Demographics and assets
   - **Scheme Recommendations**: Eligible and ineligible schemes
   - **Eligibility Analysis**: Detailed criteria breakdown

### Step 4: Review Recommendations
Each recommendation shows:
- ✅ **Scheme Name** with eligibility badge
- 📊 **Confidence Score** (0-100%)
- 🎯 **Priority Level** (High/Medium/Low)
- 💰 **Estimated Benefit Amount**
- 📝 **Recommendation Reason**
- 🏛️ **Department** and benefits description

---

## Component Architecture

```
DecisionSupportEngine.tsx
│
├── State Management
│   ├── selectedPatta (selected beneficiary)
│   ├── beneficiaryProfile (demographics + assets)
│   ├── recommendations (scheme matches)
│   ├── eligibilityChecks (criteria verification)
│   └── isAnalyzing (loading state)
│
├── Data Fetching
│   ├── fetchPattas() - Get approved patta list
│   ├── fetchBeneficiaryProfile() - Load profile data
│   └── runSchemeAnalysis() - Run DSS algorithm
│
├── UI Components
│   ├── Patta Selection Dropdown
│   ├── Beneficiary Profile Card
│   ├── Scheme Recommendations List
│   └── Eligibility Checks Table
│
└── Analysis Logic
    ├── Eligibility Rule Engine
    ├── Confidence Score Calculator
    ├── Priority Assignment
    └── Recommendation Storage
```

---

## API Integration Points

### Supabase Queries

**Fetch Pattas**
```typescript
const { data, error } = await supabase
  .from('pattas')
  .select('id, holder_name, village, district, land_area')
  .eq('status', 'approved');
```

**Fetch Beneficiary Profile**
```typescript
const { data, error } = await supabase
  .from('pattas')
  .select(`
    *,
    assets (*)
  `)
  .eq('id', selectedPatta)
  .single();
```

**Fetch Schemes**
```typescript
const { data, error } = await supabase
  .from('schemes')
  .select('*')
  .eq('is_active', true);
```

**Save Recommendations**
```typescript
const { error } = await supabase
  .from('scheme_recommendations')
  .insert([
    {
      patta_id: beneficiary.patta_id,
      scheme_id: scheme.id,
      recommendation_reason: reason,
      confidence_score: score
    }
  ]);
```

---

## Customization & Extension

### Adding New Schemes

```sql
INSERT INTO public.schemes (name, description, eligibility_criteria, benefits, department, is_active) 
VALUES (
  'Your Scheme Name',
  'Detailed description',
  '{"criteria_key": "value", "land_area": ">2", "water_access": true}',
  'Scheme benefits description',
  'Department Name',
  true
);
```

### Modifying Eligibility Rules

Edit `DecisionSupportEngine.tsx` around line 140-240:

```typescript
// Add new scheme eligibility logic
if (scheme.name === 'Your Scheme Name') {
  const customEligible = beneficiaryProfile.custom_criteria;
  eligibilityResults.push({
    criteria: 'Your custom criteria',
    met: customEligible,
    value: beneficiaryProfile.custom_value,
    threshold: 'Your threshold'
  });
  
  if (customEligible) {
    eligibilityMet = true;
    score = 0.90;
    reason = 'Your eligibility reason';
  } else {
    eligibilityMet = false;
    reason = 'Reason for ineligibility';
  }
}
```

### Adding Custom Beneficiary Attributes

1. **Update Beneficiary Profile Interface** (line 31-44):
```typescript
interface BeneficiaryProfile {
  // ... existing fields
  custom_field: string | number | boolean;
}
```

2. **Update Profile Creation Logic** (line 93-106):
```typescript
const profile: BeneficiaryProfile = {
  // ... existing fields
  custom_field: patta.custom_value || default_value
};
```

---

## Testing & Verification

### Test Different Scenarios

**Small Farmer Test**
```
Select: Dharani Majhi (1.2 ha)
Expected: PM-KISAN, MGNREGA, possibly Jal Jeevan
```

**Community Forest Test**
```
Select: Baidhar Sabar (8.5 ha)
Expected: Van Dhan Vikas, Forest Rights Act
```

**Water-Poor Area Test**
```
Select: Kaluram Meena (5.8 ha, Rajasthan)
Expected: Jal Jeevan Mission, PMKSY (Irrigation)
```

**Fishery Candidate Test**
```
Select: Sushila Ho (has pond asset)
Expected: Matsya Sampada Yojana
```

### Verify Data Integrity

```sql
-- Check total pattas
SELECT COUNT(*) FROM public.pattas;

-- Check approved pattas
SELECT COUNT(*) FROM public.pattas WHERE status = 'approved';

-- Check active schemes
SELECT COUNT(*) FROM public.schemes WHERE is_active = true;

-- Check recommendations
SELECT COUNT(*) FROM public.scheme_recommendations;

-- View DSS dashboard summary
SELECT * FROM public.dss_dashboard_summary;
```

---

## Troubleshooting

### No Pattas Appearing in Dropdown
**Issue**: Dropdown shows "Select Patta Holder" but no options  
**Solution**: 
1. Check if migrations ran successfully
2. Verify data exists: `SELECT * FROM public.pattas WHERE status = 'approved';`
3. Check browser console for errors
4. Verify Supabase connection in `src/integrations/supabase/client.ts`

### Analysis Button Not Working
**Issue**: "Analyze Eligibility" button disabled or not responding  
**Solution**:
1. Ensure a patta holder is selected
2. Check browser console for API errors
3. Verify RLS policies allow SELECT on schemes table
4. Check network tab for failed requests

### No Recommendations Generated
**Issue**: Analysis completes but shows 0 eligible schemes  
**Solution**:
1. Verify schemes exist: `SELECT * FROM public.schemes WHERE is_active = true;`
2. Check eligibility criteria in scheme records
3. Review browser console for JavaScript errors
4. Test with different patta holders

### Database Connection Errors
**Issue**: "Failed to fetch" or connection timeout errors  
**Solution**:
1. Check Supabase project status
2. Verify `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Check internet connection
4. Verify RLS policies are not blocking queries

---

## Performance Optimization

### Indexes Already Created
```sql
idx_scheme_recommendations_patta
idx_scheme_recommendations_scheme
idx_scheme_recommendations_status
idx_pattas_status
idx_pattas_tribal_group
idx_assets_type
idx_pattas_coordinates (GIST)
idx_assets_coordinates (GIST)
```

### Materialized View
```sql
dss_dashboard_summary - Aggregate statistics for dashboard
```

Refresh materialized view after bulk updates:
```sql
REFRESH MATERIALIZED VIEW public.dss_dashboard_summary;
```

---

## Analytics & Reporting

### Available Metrics
The `dss_analytics` table tracks:
- Scheme recommendations generated
- Eligible beneficiaries identified
- Scheme applications submitted
- Community feedback received
- Asset verifications completed
- Schemes successfully implemented
- Average confidence score
- Forest cover improvement
- Livelihood improvement percentage
- Water access improvement

### Query Analytics
```sql
-- Top recommended schemes
SELECT s.name, COUNT(*) as recommendation_count
FROM scheme_recommendations sr
JOIN schemes s ON sr.scheme_id = s.id
WHERE sr.status = 'accepted'
GROUP BY s.name
ORDER BY recommendation_count DESC;

-- State-wise coverage
SELECT state, COUNT(*) as beneficiaries
FROM pattas
WHERE status = 'approved'
GROUP BY state
ORDER BY beneficiaries DESC;

-- Average confidence by scheme
SELECT s.name, AVG(sr.confidence_score) as avg_confidence
FROM scheme_recommendations sr
JOIN schemes s ON sr.scheme_id = s.id
GROUP BY s.name
ORDER BY avg_confidence DESC;
```

---

## Security Considerations

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

- **Pattas**: Public can view approved records, authenticated users see all
- **Schemes**: Public can view active schemes
- **Recommendations**: Public can view all recommendations
- **Assets**: Public read access
- **Feedback**: Public can view verified feedback

### Data Privacy
- Personal identifiable information (PII) is protected
- Phone numbers are partially masked in UI
- Location coordinates are rounded for privacy
- Only verified feedback is publicly visible

---

## Future Enhancements

### Planned Features
- [ ] Machine Learning-based eligibility prediction
- [ ] Multi-language support for scheme descriptions
- [ ] PDF report generation for recommendations
- [ ] SMS notifications for eligible schemes
- [ ] WhatsApp integration for application status
- [ ] Mobile app for field officers
- [ ] Real-time scheme updates from government APIs
- [ ] Geographic clustering for area-based schemes
- [ ] Historical trend analysis
- [ ] Scheme success rate tracking

### Integration Possibilities
- **e-District**: Auto-fill beneficiary data
- **PM-Kisan Portal**: Direct application submission
- **Aadhaar**: Identity verification
- **Land Records**: Automated land area verification
- **Bank APIs**: Direct benefit transfer tracking

---

## Support & Resources

### Documentation
- [Forest Rights Act 2006](https://tribal.nic.in/FRA.aspx)
- [Supabase Documentation](https://supabase.com/docs)
- [React + TypeScript Guide](https://react.dev/learn/typescript)

### Code Repository
- GitHub: [Your Repo URL]
- Issues: [Your Issues URL]

### Contact
- Team: AranyaX
- Event: Smart India Hackathon 2025
- Ministry: Ministry of Tribal Affairs (MoTA)

---

## Quick Reference

### File Locations
```
├── src/
│   ├── components/
│   │   └── DecisionSupportEngine.tsx    # Main DSS component
│   ├── pages/
│   │   └── Landing.tsx                   # Landing page with DSS link
│   └── integrations/
│       └── supabase/
│           ├── client.ts                 # Supabase client config
│           └── types.ts                  # TypeScript types
├── supabase/
│   └── migrations/
│       ├── 20250908034447_*.sql         # Schema creation
│       ├── add_dss_sample_data.sql      # Sample data
│       └── add_user_profiles.sql        # User profiles
└── setup_dss_data.ps1                   # Setup script
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### URLs
- DSS Engine: `/aranyx`
- Dashboard: `/dashboard`
- Atlas View: `/atlas`
- Analytics: `/analytics`

---

## Conclusion

The Decision Support Engine is now fully configured with comprehensive dummy data representing diverse tribal communities across India. The system can analyze 19+ patta holders against 18+ government schemes, generating intelligent recommendations with confidence scores and priority levels.

**Next Steps:**
1. Run `.\setup_dss_data.ps1` to populate the database
2. Navigate to `/aranyx` in your application
3. Select a patta holder and click "Analyze Eligibility"
4. Review the generated recommendations
5. Customize eligibility rules as needed for your specific use case

For questions or issues, refer to the Troubleshooting section or check the browser console for error messages.

**Happy Building! 🚀**
