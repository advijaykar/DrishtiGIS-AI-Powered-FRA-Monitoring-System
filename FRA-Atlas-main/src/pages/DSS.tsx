import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BarChart3, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Users, TreePine, MapPin, Lightbulb, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

// Mock data for DSS
const mockRecommendations = [
  {
    id: 1,
    village: "Patalkot",
    scheme: "PM-KISAN",
    confidence: 92,
    impact: "High",
    priority: "Immediate",
    reasoning: "High tribal population, low income, suitable land area",
    beneficiaries: 89,
    estimatedCost: "₹8.9 lakhs"
  },
  {
    id: 2,
    village: "Similiguda", 
    scheme: "MGNREGA Plus",
    confidence: 87,
    impact: "Medium",
    priority: "Medium",
    reasoning: "Underutilized workforce, forest connectivity required",
    beneficiaries: 134,
    estimatedCost: "₹12.4 lakhs"
  },
  {
    id: 3,
    village: "Eturnagaram",
    scheme: "Van Dhan Vikas",
    confidence: 94,
    impact: "High", 
    priority: "Immediate",
    reasoning: "Rich NTFP resources, existing SHG structure",
    beneficiaries: 67,
    estimatedCost: "₹6.7 lakhs"
  }
];

const mockAnalytics = {
  totalVillages: 247,
  activeSchemes: 12,
  beneficiaries: 15847,
  successRate: 87,
  pendingReviews: 34,
  completedAssessments: 213
};

const DSS = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    state: "all",
    priority: "all",
    confidence: 80
  });

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const handleGenerateRecommendations = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("New recommendations generated based on latest satellite data and IoT sensors!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.backToHome')}
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('dss.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('dss.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSelector variant="compact" />
              <Badge variant="secondary" className="bg-success/10 text-success">
                <Target className="w-3 h-3 mr-1" />
                {t('dss.activeAnalytics')}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {t('dss.dashboard')}
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              {t('dss.recommendations')}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('dss.analytics')}
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('dss.monitoring')}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('dss.totalVillages')}</p>
                        <p className="text-2xl font-bold text-primary">{mockAnalytics.totalVillages}</p>
                      </div>
                      <TreePine className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('dss.activeSchemes')}</p>
                        <p className="text-2xl font-bold text-success">{mockAnalytics.activeSchemes}</p>
                      </div>
                      <Target className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('dss.beneficiaries')}</p>
                        <p className="text-2xl font-bold text-accent">{mockAnalytics.beneficiaries.toLocaleString()}</p>
                      </div>
                      <Users className="w-8 h-8 text-accent" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('dss.successRate')}</p>
                        <p className="text-2xl font-bold text-success">{mockAnalytics.successRate}%</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Real-time Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    {t('dss.realTimeAlerts')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                        <span className="text-sm">Forest encroachment detected in Sector 7, Patalkot</span>
                      </div>
                      <Badge variant="outline" className="text-xs">2 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm">MGNREGA work completion confirmed in Similiguda</span>
                      </div>
                      <Badge variant="outline" className="text-xs">15 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">New patta applications received from Eturnagaram (23)</span>
                      </div>
                      <Badge variant="outline" className="text-xs">1 hour ago</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">{t('dss.aiRecommendations')}</h3>
                <p className="text-sm text-muted-foreground">{t('dss.recommendationDescription')}</p>
              </div>
              <Button onClick={handleGenerateRecommendations} disabled={loading} className="bg-primary hover:bg-primary-hover">
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {t('dss.generating')}
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {t('dss.generateNew')}
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {mockRecommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{rec.scheme}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {rec.village}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={rec.priority === "Immediate" ? "destructive" : "secondary"}>
                            {rec.priority}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rec.confidence}% {t('dss.confidence')}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('dss.estimatedBeneficiaries')}</p>
                          <p className="font-medium">{rec.beneficiaries} {t('village.families')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('dss.estimatedCost')}</p>
                          <p className="font-medium">{rec.estimatedCost}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('dss.expectedImpact')}</p>
                          <Badge variant={rec.impact === "High" ? "default" : "outline"}>
                            {rec.impact}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-lg mb-4">
                        <p className="text-sm"><strong>{t('dss.aiReasoning')}:</strong> {rec.reasoning}</p>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>{t('dss.confidence')}</span>
                          <span>{rec.confidence}%</span>
                        </div>
                        <Progress value={rec.confidence} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="bg-success hover:bg-success/90">
                          {t('dss.approve')}
                        </Button>
                        <Button size="sm" variant="outline">
                          {t('dss.review')}
                        </Button>
                        <Button size="sm" variant="ghost">
                          {t('dss.viewDetails')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {t('dss.schemePerformance')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>PM-KISAN</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>MGNREGA</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Van Dhan Vikas</span>
                        <span>94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>SBM-G</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t('dss.impactMetrics')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('dss.livelihoodImprovement')}</span>
                      <Badge className="bg-success">+23%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('dss.forestCoverIncrease')}</span>
                      <Badge className="bg-primary">+12%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('dss.incomeIncrease')}</span>
                      <Badge className="bg-success">+34%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('dss.fuelWoodReduction')}</span>
                      <Badge className="bg-warning">-18%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('dss.satelliteInsights')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TreePine className="w-6 h-6 text-success" />
                    </div>
                    <p className="font-semibold">2,340 ha</p>
                    <p className="text-xs text-muted-foreground">{t('dss.forestRegrowth')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertTriangle className="w-6 h-6 text-warning" />
                    </div>
                    <p className="font-semibold">34 alerts</p>
                    <p className="text-xs text-muted-foreground">{t('dss.encroachmentDetected')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-semibold">89%</p>
                    <p className="text-xs text-muted-foreground">{t('dss.accuracyRate')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {t('dss.pendingReviews')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Van Dhan Proposal - Similiguda</p>
                        <p className="text-xs text-muted-foreground">Submitted 2 days ago</p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">MGNREGA Extension - Patalkot</p>
                        <p className="text-xs text-muted-foreground">Submitted 5 days ago</p>
                      </div>
                      <Badge variant="outline">Under Review</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Patta Verification - Eturnagaram</p>
                        <p className="text-xs text-muted-foreground">Submitted 1 week ago</p>
                      </div>
                      <Badge className="bg-warning">Urgent</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    {t('dss.viewAllReviews')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {t('dss.systemHealth')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('dss.satelliteConnection')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-xs text-success">{t('dss.active')}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('dss.iotSensors')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-xs text-success">247/250</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('dss.databaseSync')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                        <span className="text-xs text-warning">{t('dss.syncing')}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('dss.aiModels')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-xs text-success">{t('dss.operational')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DSS;