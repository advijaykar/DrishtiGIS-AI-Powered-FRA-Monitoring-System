import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Target, TrendingUp, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SchemeRecommendation {
  id: string;
  scheme_name: string;
  department: string;
  benefits: string;
  eligibility_met: boolean;
  confidence_score: number;
  recommendation_reason: string;
  estimated_benefit_amount?: number;
  application_deadline?: Date;
  priority: 'high' | 'medium' | 'low';
}

interface EligibilityCheck {
  criteria: string;
  met: boolean;
  value: string | number;
  threshold: string | number;
}

interface BeneficiaryProfile {
  patta_id: string;
  holder_name: string;
  land_area: number;
  has_water_access: boolean;
  has_toilet: boolean;
  is_homeless: boolean;
  is_below_poverty_line: boolean;
  household_members: number;
  income_level: 'low' | 'medium' | 'high';
  village: string;
  district: string;
  state: string;
}

export const DecisionSupportEngine: React.FC = () => {
  const { toast } = useToast();
  const [selectedPatta, setSelectedPatta] = useState<string>('');
  const [beneficiaryProfile, setBeneficiaryProfile] = useState<BeneficiaryProfile | null>(null);
  const [recommendations, setRecommendations] = useState<SchemeRecommendation[]>([]);
  const [eligibilityChecks, setEligibilityChecks] = useState<EligibilityCheck[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pattas, setPattas] = useState<any[]>([]);

  useEffect(() => {
    fetchPattas();
  }, []);

  useEffect(() => {
    if (selectedPatta) {
      fetchBeneficiaryProfile();
    }
  }, [selectedPatta]);

  const fetchPattas = async () => {
    try {
      const { data, error } = await supabase
        .from('pattas')
        .select('id, holder_name, village, district, land_area')
        .eq('status', 'approved');

      if (error) throw error;
      setPattas(data || []);
    } catch (error) {
      console.error('Error fetching pattas:', error);
    }
  };

  const fetchBeneficiaryProfile = async () => {
    try {
      const { data: patta, error } = await supabase
        .from('pattas')
        .select(`
          *,
          assets (*)
        `)
        .eq('id', selectedPatta)
        .single();

      if (error) throw error;

      // Create beneficiary profile with mock additional data
      const profile: BeneficiaryProfile = {
        patta_id: patta.id,
        holder_name: patta.holder_name,
        land_area: patta.land_area || 0,
        has_water_access: false, // Mock data
        has_toilet: Math.random() > 0.6,
        is_homeless: false,
        is_below_poverty_line: patta.land_area < 2,
        household_members: Math.floor(Math.random() * 6) + 2,
        income_level: patta.land_area > 3 ? 'medium' : 'low',
        village: patta.village,
        district: patta.district,
        state: patta.state
      };

      // Check if water bodies exist in assets
      const hasWaterAssets = patta.assets?.some((asset: any) => 
        asset.asset_type === 'water_body' || asset.asset_type === 'pond'
      );
      profile.has_water_access = hasWaterAssets || Math.random() > 0.7;

      setBeneficiaryProfile(profile);
    } catch (error) {
      console.error('Error fetching beneficiary profile:', error);
    }
  };

  const runSchemeAnalysis = async () => {
    if (!beneficiaryProfile) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch available schemes
      const { data: schemes, error } = await supabase
        .from('schemes')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const recommendations: SchemeRecommendation[] = [];
      const eligibilityResults: EligibilityCheck[] = [];

      schemes?.forEach(scheme => {
        const criteria = scheme.eligibility_criteria as any;
        let eligibilityMet = true;
        let score = 0.8; // Base confidence
        let reason = '';

        // PM-KISAN eligibility
        if (scheme.name === 'PM-KISAN') {
          const landEligible = beneficiaryProfile.land_area <= 2;
          eligibilityResults.push({
            criteria: 'Land size ≤ 2 hectares',
            met: landEligible,
            value: beneficiaryProfile.land_area,
            threshold: 2
          });
          
          if (landEligible) {
            eligibilityMet = true;
            score = 0.95;
            reason = 'Small/marginal farmer with land ≤ 2 hectares';
          } else {
            eligibilityMet = false;
            reason = 'Land holding exceeds 2 hectares limit';
          }
        }

        // Jal Jeevan Mission eligibility
        if (scheme.name === 'Jal Jeevan Mission') {
          const waterEligible = !beneficiaryProfile.has_water_access;
          eligibilityResults.push({
            criteria: 'No piped water access',
            met: waterEligible,
            value: beneficiaryProfile.has_water_access ? 'Has access' : 'No access',
            threshold: 'No access required'
          });
          
          if (waterEligible) {
            eligibilityMet = true;
            score = 0.92;
            reason = 'Rural household without piped water access';
          } else {
            eligibilityMet = false;
            reason = 'Already has water access';
          }
        }

        // MGNREGA eligibility
        if (scheme.name === 'MGNREGA') {
          const ruralEligible = true; // All FRA holders are rural
          eligibilityResults.push({
            criteria: 'Rural household with adult members',
            met: ruralEligible,
            value: beneficiaryProfile.household_members,
            threshold: '≥ 1 adult'
          });
          
          eligibilityMet = true;
          score = 0.88;
          reason = 'Rural household eligible for employment guarantee';
        }

        // PMAY-G eligibility
        if (scheme.name === 'PMAY-G') {
          const housingEligible = beneficiaryProfile.is_homeless || beneficiaryProfile.is_below_poverty_line;
          eligibilityResults.push({
            criteria: 'Homeless or below poverty line',
            met: housingEligible,
            value: beneficiaryProfile.is_below_poverty_line ? 'Below poverty line' : 'Above poverty line',
            threshold: 'Below poverty line'
          });
          
          if (housingEligible) {
            eligibilityMet = true;
            score = 0.90;
            reason = 'Eligible for rural housing assistance';
          } else {
            eligibilityMet = false;
            reason = 'Not homeless or below poverty line';
          }
        }

        // Swachh Bharat Mission eligibility
        if (scheme.name === 'Swachh Bharat Mission') {
          const toiletEligible = !beneficiaryProfile.has_toilet;
          eligibilityResults.push({
            criteria: 'No toilet facility',
            met: toiletEligible,
            value: beneficiaryProfile.has_toilet ? 'Has toilet' : 'No toilet',
            threshold: 'No toilet required'
          });
          
          if (toiletEligible) {
            eligibilityMet = true;
            score = 0.94;
            reason = 'Rural household without toilet facility';
          } else {
            eligibilityMet = false;
            reason = 'Already has toilet facility';
          }
        }

        recommendations.push({
          id: scheme.id,
          scheme_name: scheme.name,
          department: scheme.department,
          benefits: scheme.benefits,
          eligibility_met: eligibilityMet,
          confidence_score: score,
          recommendation_reason: reason,
          estimated_benefit_amount: eligibilityMet ? Math.floor(Math.random() * 50000) + 5000 : undefined,
          application_deadline: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
          priority: eligibilityMet ? (score > 0.9 ? 'high' : 'medium') : 'low'
        });
      });

      // Sort by eligibility and confidence score
      recommendations.sort((a, b) => {
        if (a.eligibility_met !== b.eligibility_met) {
          return a.eligibility_met ? -1 : 1;
        }
        return b.confidence_score - a.confidence_score;
      });

      setRecommendations(recommendations);
      setEligibilityChecks(eligibilityResults);

      // Save recommendations to database
      const eligibleRecommendations = recommendations.filter(r => r.eligibility_met);
      if (eligibleRecommendations.length > 0) {
        const { error: saveError } = await supabase
          .from('scheme_recommendations')
          .insert(
            eligibleRecommendations.map(rec => ({
              patta_id: beneficiaryProfile.patta_id,
              scheme_id: rec.id,
              recommendation_reason: rec.recommendation_reason,
              confidence_score: rec.confidence_score
            }))
          );

        if (saveError) console.error('Error saving recommendations:', saveError);
      }

      toast({
        title: "Analysis Complete",
        description: `Found ${eligibleRecommendations.length} eligible schemes`,
      });

    } catch (error) {
      console.error('Error running scheme analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze scheme eligibility",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'medium': return Target;
      case 'low': return CheckCircle;
      default: return CheckCircle;
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Decision Support Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Select value={selectedPatta} onValueChange={setSelectedPatta}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Patta Holder for Analysis" />
                </SelectTrigger>
                <SelectContent>
                  {pattas.map(patta => (
                    <SelectItem key={patta.id} value={patta.id}>
                      {patta.holder_name} - {patta.village} ({patta.land_area} ha)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={runSchemeAnalysis}
              disabled={isAnalyzing || !selectedPatta}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Analyze Eligibility
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Beneficiary Profile */}
      {beneficiaryProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Beneficiary Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="font-semibold">Name</div>
                <div>{beneficiaryProfile.holder_name}</div>
              </div>
              <div>
                <div className="font-semibold">Land Area</div>
                <div>{beneficiaryProfile.land_area} hectares</div>
              </div>
              <div>
                <div className="font-semibold">Location</div>
                <div>{beneficiaryProfile.village}, {beneficiaryProfile.district}</div>
              </div>
              <div>
                <div className="font-semibold">Household Size</div>
                <div>{beneficiaryProfile.household_members} members</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${beneficiaryProfile.has_water_access ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Water Access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${beneficiaryProfile.has_toilet ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Toilet Facility</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${beneficiaryProfile.is_below_poverty_line ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-sm">Poverty Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${beneficiaryProfile.income_level === 'low' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm">Income Level</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheme Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Scheme Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map(rec => {
                const PriorityIcon = getPriorityIcon(rec.priority);
                return (
                  <div 
                    key={rec.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.eligibility_met 
                        ? 'border-green-500 bg-green-50/50' 
                        : 'border-red-500 bg-red-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{rec.scheme_name}</h4>
                          <Badge variant={rec.eligibility_met ? 'default' : 'secondary'}>
                            {rec.eligibility_met ? 'Eligible' : 'Not Eligible'}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {rec.priority.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {rec.department} • {rec.benefits}
                        </p>
                        
                        <p className="text-sm mb-2">
                          <strong>Reason:</strong> {rec.recommendation_reason}
                        </p>
                        
                        {rec.estimated_benefit_amount && (
                          <p className="text-sm text-green-600 font-medium">
                            Estimated Benefit: ₹{rec.estimated_benefit_amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {(rec.confidence_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eligibility Checks */}
      {eligibilityChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eligibilityChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${check.met ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">{check.criteria}</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm">
                      Current: <strong>{check.value}</strong>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Required: {check.threshold}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          Rule-based recommendation engine analyzes land size, water access, housing status, and income to suggest eligible government schemes like PM-KISAN, Jal Jeevan Mission, and MGNREGA.
        </AlertDescription>
      </Alert>
    </div>
  );
};