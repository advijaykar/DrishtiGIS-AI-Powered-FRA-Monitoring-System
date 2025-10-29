import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Map, 
  FileText, 
  Cpu, 
  MessageSquare, 
  BarChart3, 
  Wifi,
  Users,
  MapPin,
  Zap,
  TrendingUp
} from 'lucide-react';
import { AIDocumentDigitizer } from './AIDocumentDigitizer';
import { SmartFRAAtlas } from './SmartFRAAtlas';
import { AIAssetMapper } from './AIAssetMapper';
import { CommunityFeedbackLoop } from './CommunityFeedbackLoop';
import { DecisionSupportEngine } from './DecisionSupportEngine';
import { IoTDashboard } from './IoTDashboard';

interface DashboardStats {
  totalPattas: number;
  processedDocuments: number;
  activeIoTSensors: number;
  communityReports: number;
  schemeRecommendations: number;
  digitalizedVillages: number;
}

export const UnifiedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const stats: DashboardStats = {
    totalPattas: 1247,
    processedDocuments: 89,
    activeIoTSensors: 23,
    communityReports: 156,
    schemeRecommendations: 342,
    digitalizedVillages: 12
  };

  const recentActivities = [
    { id: 1, type: 'document', message: 'New FRA document processed for Kumargram Village', time: '5 min ago' },
    { id: 2, type: 'iot', message: 'Soil moisture alert in Birpara Forest area', time: '12 min ago' },
    { id: 3, type: 'feedback', message: 'Community feedback received with geotagged photos', time: '18 min ago' },
    { id: 4, type: 'scheme', message: 'PM-KISAN recommendation generated for 15 beneficiaries', time: '25 min ago' },
    { id: 5, type: 'asset', message: 'New water body detected via satellite analysis', time: '32 min ago' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'iot': return <Wifi className="h-4 w-4 text-green-500" />;
      case 'feedback': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'scheme': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'asset': return <Map className="h-4 w-4 text-teal-500" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AranyaX Dashboard</h1>
          <p className="text-muted-foreground">AI-Powered WebGIS Decision Support System for FRA Implementation</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          SIH 2025 - Team AranyaX
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="digitizer" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            AI Digitizer
          </TabsTrigger>
          <TabsTrigger value="atlas" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            FRA Atlas
          </TabsTrigger>
          <TabsTrigger value="mapper" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Asset Mapper
          </TabsTrigger>
          <TabsTrigger value="iot" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            IoT Monitor
          </TabsTrigger>
          <TabsTrigger value="dss" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            DSS Engine
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Community
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total FRA Pattas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPattas}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processed Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.processedDocuments}</div>
                <p className="text-xs text-muted-foreground">AI-extracted data</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active IoT Sensors</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeIoTSensors}</div>
                <p className="text-xs text-muted-foreground">LoRaWAN network</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community Reports</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.communityReports}</div>
                <p className="text-xs text-muted-foreground">Geotagged feedback</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheme Links</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.schemeRecommendations}</div>
                <p className="text-xs text-muted-foreground">AI recommendations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Digital Villages</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.digitalizedVillages}</div>
                <p className="text-xs text-muted-foreground">Pilot implementation</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Document Processing</span>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">IoT Connectivity</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">AI Model Accuracy</span>
                      <span className="text-sm font-medium">91%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Community Engagement</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="digitizer">
          <AIDocumentDigitizer />
        </TabsContent>

        <TabsContent value="atlas">
          <SmartFRAAtlas />
        </TabsContent>

        <TabsContent value="mapper">
          <AIAssetMapper />
        </TabsContent>

        <TabsContent value="iot">
          <IoTDashboard />
        </TabsContent>

        <TabsContent value="dss">
          <DecisionSupportEngine />
        </TabsContent>

        <TabsContent value="feedback">
          <CommunityFeedbackLoop />
        </TabsContent>
      </Tabs>
    </div>
  );
};