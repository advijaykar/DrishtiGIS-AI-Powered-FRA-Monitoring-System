import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Satellite, MapPin, TrendingUp, Eye, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AssetDetectionResult {
  id: string;
  asset_type: 'farmland' | 'water_body' | 'homestead' | 'forest' | 'pond';
  area: number;
  confidence_score: number;
  coordinates: { lat: number; lng: number };
  detected_at: Date;
  verified_by_user: boolean;
}

interface VillageInsights {
  village_name: string;
  total_pattas: number;
  farmland_percentage: number;
  water_bodies_count: number;
  forest_area: number;
  total_area: number;
  households: number;
}

interface MLModelStats {
  accuracy: number;
  processed_tiles: number;
  last_updated: Date;
  model_version: string;
}

export const AIAssetMapper: React.FC = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [detectionResults, setDetectionResults] = useState<AssetDetectionResult[]>([]);
  const [villageInsights, setVillageInsights] = useState<VillageInsights | null>(null);
  const [modelStats, setModelStats] = useState<MLModelStats>({
    accuracy: 0.94,
    processed_tiles: 1250,
    last_updated: new Date(),
    model_version: 'CNN-RF-v2.1'
  });

  const villages = [
    'Kumargram', 'Birpara', 'Madarihat', 'Kalchini', 'Nagrakata',
    'Alipurduar', 'Falakata', 'Dhupguri', 'Mal', 'Matiali'
  ];

  useEffect(() => {
    if (selectedVillage) {
      fetchVillageData();
    }
  }, [selectedVillage]);

  const fetchVillageData = async () => {
    if (!selectedVillage) return;

    try {
      // Fetch pattas for the selected village
      const { data: pattas, error } = await supabase
        .from('pattas')
        .select(`
          *,
          assets (*)
        `)
        .eq('village', selectedVillage);

      if (error) throw error;

      // Calculate insights
      const insights: VillageInsights = {
        village_name: selectedVillage,
        total_pattas: pattas?.length || 0,
        farmland_percentage: 0,
        water_bodies_count: 0,
        forest_area: 0,
        total_area: 0,
        households: pattas?.filter(p => p.claim_type === 'individual').length || 0
      };

      let totalFarmlandArea = 0;
      let totalVillageArea = 0;
      const waterBodies = new Set();

      pattas?.forEach(patta => {
        totalVillageArea += patta.land_area || 0;
        
        patta.assets?.forEach((asset: any) => {
          if (asset.asset_type === 'farmland') {
            totalFarmlandArea += asset.area || 0;
          } else if (asset.asset_type === 'water_body' || asset.asset_type === 'pond') {
            waterBodies.add(asset.id);
          } else if (asset.asset_type === 'forest') {
            insights.forest_area += asset.area || 0;
          }
        });
      });

      insights.farmland_percentage = totalVillageArea > 0 ? (totalFarmlandArea / totalVillageArea) * 100 : 0;
      insights.water_bodies_count = waterBodies.size;
      insights.total_area = totalVillageArea;

      setVillageInsights(insights);

      // Extract detection results
      const results: AssetDetectionResult[] = [];
      pattas?.forEach(patta => {
        patta.assets?.forEach((asset: any) => {
          results.push({
            id: asset.id,
            asset_type: asset.asset_type,
            area: asset.area || 0,
            confidence_score: asset.confidence_score || 0,
            coordinates: { lat: 26.5 + Math.random(), lng: 89.1 + Math.random() },
            detected_at: new Date(asset.detected_at),
            verified_by_user: asset.verified_by_user || false
          });
        });
      });

      setDetectionResults(results);

    } catch (error) {
      console.error('Error fetching village data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch village data",
        variant: "destructive",
      });
    }
  };

  const runAssetDetection = async () => {
    if (!selectedVillage) {
      toast({
        title: "Village Required",
        description: "Please select a village to run asset detection",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate ML processing steps
      const steps = [
        'Loading satellite imagery...',
        'Preprocessing image tiles...',
        'Running CNN feature extraction...',
        'Applying Random Forest classifier...',
        'Post-processing detections...',
        'Calculating confidence scores...',
        'Overlaying on FRA map...',
        'Generating insights...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(((i + 1) / steps.length) * 100);
        
        toast({
          title: "Processing",
          description: steps[i],
        });
      }

      // Simulate detection results
      const mockResults: AssetDetectionResult[] = [
        {
          id: '1',
          asset_type: 'farmland',
          area: 2.3,
          confidence_score: 0.96,
          coordinates: { lat: 26.567, lng: 89.123 },
          detected_at: new Date(),
          verified_by_user: false
        },
        {
          id: '2',
          asset_type: 'pond',
          area: 0.2,
          confidence_score: 0.89,
          coordinates: { lat: 26.568, lng: 89.124 },
          detected_at: new Date(),
          verified_by_user: false
        },
        {
          id: '3',
          asset_type: 'homestead',
          area: 0.1,
          confidence_score: 0.98,
          coordinates: { lat: 26.569, lng: 89.125 },
          detected_at: new Date(),
          verified_by_user: false
        }
      ];

      setDetectionResults(mockResults);

      // Update model stats
      setModelStats(prev => ({
        ...prev,
        processed_tiles: prev.processed_tiles + Math.floor(Math.random() * 50),
        last_updated: new Date()
      }));

      toast({
        title: "Detection Complete",
        description: `Found ${mockResults.length} assets with AI analysis`,
      });

    } catch (error) {
      console.error('Error running asset detection:', error);
      toast({
        title: "Detection Failed",
        description: "Failed to run asset detection",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyAsset = async (assetId: string) => {
    try {
      await supabase
        .from('assets')
        .update({ 
          verified_by_user: true,
          verification_date: new Date().toISOString()
        })
        .eq('id', assetId);

      setDetectionResults(prev => prev.map(result => 
        result.id === assetId 
          ? { ...result, verified_by_user: true }
          : result
      ));

      toast({
        title: "Asset Verified",
        description: "Asset has been verified by user",
      });
    } catch (error) {
      console.error('Error verifying asset:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify asset",
        variant: "destructive",
      });
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'farmland': return '🌾';
      case 'water_body': return '💧';
      case 'pond': return '🏊';
      case 'homestead': return '🏠';
      case 'forest': return '🌲';
      default: return '📍';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-based Asset Mapper
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Village for Analysis" />
                </SelectTrigger>
                <SelectContent>
                  {villages.map(village => (
                    <SelectItem key={village} value={village}>
                      {village}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={runAssetDetection}
              disabled={isProcessing || !selectedVillage}
              className="flex items-center gap-2"
            >
              <Satellite className="h-4 w-4" />
              Run AI Detection
            </Button>
          </div>

          {isProcessing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processing satellite imagery...</span>
                <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ML Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(modelStats.accuracy * 100).toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{modelStats.processed_tiles}</div>
              <div className="text-sm text-muted-foreground">Processed Tiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{modelStats.model_version}</div>
              <div className="text-sm text-muted-foreground">Model Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">CNN+RF</div>
              <div className="text-sm text-muted-foreground">Algorithm</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Village Insights */}
      {villageInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Village Insights: {villageInsights.village_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold">{villageInsights.total_pattas}</div>
                <div className="text-sm text-muted-foreground">Total Pattas</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{villageInsights.farmland_percentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Farmland</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{villageInsights.water_bodies_count}</div>
                <div className="text-sm text-muted-foreground">Water Bodies</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{villageInsights.forest_area.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Forest (ha)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{villageInsights.total_area.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Total Area (ha)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{villageInsights.households}</div>
                <div className="text-sm text-muted-foreground">Households</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detection Results */}
      {detectionResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              AI Detection Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {detectionResults.map(result => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getAssetIcon(result.asset_type)}</span>
                    <div>
                      <div className="font-medium capitalize">
                        {result.asset_type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Area: {result.area} hectares
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`font-medium ${getConfidenceColor(result.confidence_score)}`}>
                        {(result.confidence_score * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                    
                    {result.verified_by_user ? (
                      <Badge variant="default">Verified</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => verifyAsset(result.id)}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Satellite className="h-4 w-4" />
        <AlertDescription>
          Supervised ML (CNN/Random Forest) analyzes satellite tiles to detect farms, water bodies, homesteads, and forests, overlaying results on the FRA map for comprehensive land asset insights.
        </AlertDescription>
      </Alert>
    </div>
  );
};