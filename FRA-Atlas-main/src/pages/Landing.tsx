import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, Users, TreePine, Shield, BarChart3, Smartphone, Satellite, Database, Search, 
  Activity, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Lightbulb, Filter,
  Bell, Eye, UserPlus, FileCheck, Settings, Navigation, Layers
} from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import MapViewer from "@/components/MapViewer";
import { UnifiedDashboard } from "@/components/UnifiedDashboard";
import { QuickActions } from "@/components/QuickActions";
import { InteractiveStats } from "@/components/InteractiveStats";

const Landing = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedRecordType, setSelectedRecordType] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaValue, setCaptchaValue] = useState("A4B2C");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // State-wise data
  const stateData = {
    mp: {
      name: "Madhya Pradesh",
      villages: 15247,
      pattas: 35089,
      districts: ["Chhindwara", "Betul", "Seoni", "Balaghat", "Mandla"]
    },
    odisha: {
      name: "Odisha", 
      villages: 12450,
      pattas: 28567,
      districts: ["Koraput", "Rayagada", "Kalahandi", "Nabarangpur", "Malkangiri"]
    },
    telangana: {
      name: "Telangana",
      villages: 13250,
      pattas: 31234,
      districts: ["Mulugu", "Jayashankar", "Kumuram Bheem", "Mancherial", "Adilabad"]
    },
    tripura: {
      name: "Tripura",
      villages: 9300,
      pattas: 30199,
      districts: ["West Tripura", "South Tripura", "North Tripura", "Dhalai"]
    }
  };

  // Get current state stats
  const getCurrentStateStats = () => {
    if (selectedState === "all" || !stateData[selectedState as keyof typeof stateData]) {
      return {
        totalVillages: Object.values(stateData).reduce((sum, state) => sum + state.villages, 0),
        approvedPattas: Object.values(stateData).reduce((sum, state) => sum + state.pattas, 0)
      };
    }
    const state = stateData[selectedState as keyof typeof stateData];
    return {
      totalVillages: state.villages,
      approvedPattas: state.pattas
    };
  };

  // Handle search functionality
  const handleSearch = () => {
    if (captchaInput !== captchaValue) {
      alert("Invalid captcha. Please try again.");
      return;
    }

    // Mock search results
    const mockResults = [
      {
        id: 1,
        holderName: "Ramesh Kumar",
        village: "Patalkot",
        district: selectedDistrict === "all" ? "Chhindwara" : selectedDistrict,
        state: selectedState === "all" ? "Madhya Pradesh" : stateData[selectedState as keyof typeof stateData]?.name,
        recordType: selectedRecordType || "IFR",
        status: "Approved",
        area: "2.5 hectares",
        surveyNo: surveyNumber || "123/A"
      },
      {
        id: 2,
        holderName: "Sunita Devi",
        village: "Semagaon",
        district: selectedDistrict === "all" ? "Chhindwara" : selectedDistrict,
        state: selectedState === "all" ? "Madhya Pradesh" : stateData[selectedState as keyof typeof stateData]?.name,
        recordType: selectedRecordType || "CFR",
        status: "Pending",
        area: "1.8 hectares",
        surveyNo: surveyNumber || "456/B"
      }
    ];

    setSearchResults(mockResults);
  };

  // Handle reset
  const handleReset = () => {
    setSelectedState("all");
    setSelectedDistrict("all");
    setSelectedRecordType("");
    setSurveyNumber("");
    setMobileNumber("");
    setCaptchaInput("");
    setCaptchaValue(Math.random().toString(36).substring(2, 7).toUpperCase());
    setSearchResults([]);
  };

  const currentStats = getCurrentStateStats();

  // Mock data for integrated dashboard
  const dashboardStats = {
    totalVillages: 50247,
    approvedPattas: 125089,
    activeClaims: 8456,
    pendingReviews: 234,
    systemUptime: 99.7,
    forestCover: 47.2,
    beneficiaries: 15847,
    successRate: 87
  };

  const recentAlerts = [
    {
      id: 1,
      type: "success",
      message: "New patta applications approved in Patalkot (23)",
      time: "5 min ago"
    },
    {
      id: 2,
      type: "warning", 
      message: "Forest encroachment detected in Sector 7, Similiguda",
      time: "12 min ago"
    },
    {
      id: 3,
      type: "info",
      message: "MGNREGA work completion confirmed in Eturnagaram",
      time: "1 hour ago"
    }
  ];


  const recordTypes = [
    { value: "ifr", label: t("records.ifr") },
    { value: "cfr", label: t("records.cfr") },
    { value: "patta", label: t("records.patta") },
    { value: "claims", label: t("records.claims") }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Government Header */}
      <header className="bg-primary shadow-header sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div className="w-12 h-12 bg-gov-orange rounded-full flex items-center justify-center">
                  <TreePine className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{t("header.title")}</h1>
                <p className="text-sm opacity-90">FOREST RIGHTS RECORD</p>
                <p className="text-xs opacity-75">{t("header.subtitle")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-white text-right hidden md:block">
                <p className="text-sm font-semibold">{t("header.tagline")}</p>
                <p className="text-xs opacity-90">Complete Forest Rights Management System</p>
              </div>
              <LanguageSelector variant="compact" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Record Search
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Atlas View
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Management
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI HUB
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Interactive Key Metrics */}
            <InteractiveStats />

            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Activity & System Status */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          alert.type === 'success' ? 'bg-success/10' :
                          alert.type === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            alert.type === 'success' ? 'bg-success' :
                            alert.type === 'warning' ? 'bg-warning animate-pulse' : 'bg-primary'
                          }`}></div>
                          <span className="text-sm">{alert.message}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{alert.time}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>System Uptime</span>
                      <span>{dashboardStats.systemUptime}%</span>
                    </div>
                    <Progress value={dashboardStats.systemUptime} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Forest Cover Monitoring</span>
                      <span>{dashboardStats.forestCover}%</span>
                    </div>
                    <Progress value={dashboardStats.forestCover} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Success Rate</span>
                      <span>{dashboardStats.successRate}%</span>
                    </div>
                    <Progress value={dashboardStats.successRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* State Selection */}
              <Card className="shadow-form">
                <CardHeader>
                  <CardTitle className="text-lg">State-wise Forest Rights Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {["mp", "odisha", "telangana", "tripura"].map((stateCode) => (
                      <Button
                        key={stateCode}
                        variant={selectedState === stateCode ? "default" : "outline"}
                        className="h-auto p-4 text-left transition-all hover:scale-105"
                        onClick={() => {
                          setSelectedState(stateCode);
                          setSelectedDistrict("all"); // Reset district when state changes
                        }}
                      >
                        <div className="w-full">
                          <div className="font-medium text-sm">{stateData[stateCode as keyof typeof stateData].name}</div>
                          <div className="text-xs text-muted-foreground">
                            {stateCode.toUpperCase()}
                          </div>
                          {selectedState === stateCode && (
                            <div className="mt-2 pt-2 border-t border-primary/20">
                              <div className="text-xs">
                                <div>{stateData[stateCode as keyof typeof stateData].villages.toLocaleString()} villages</div>
                                <div>{stateData[stateCode as keyof typeof stateData].pattas.toLocaleString()} pattas</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-primary">{currentStats.totalVillages.toLocaleString()}</div>
                        <div className="text-muted-foreground">Total Villages</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gov-green">{currentStats.approvedPattas.toLocaleString()}</div>
                        <div className="text-muted-foreground">Approved Pattas</div>
                      </div>
                    </div>
                    {selectedState !== "all" && (
                      <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">
                          {stateData[selectedState as keyof typeof stateData].name} Districts:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {stateData[selectedState as keyof typeof stateData].districts.map((district, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {district}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Search Form */}
              <Card className="shadow-form">
                <CardHeader>
                  <CardTitle>Select Record of Right</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Record Type Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "ifr", label: "Individual Forest Rights (IFR)" },
                      { value: "cfr", label: "Community Forest Rights (CFR)" },
                      { value: "patta", label: "Patta Records" },
                      { value: "claims", label: "Claims Status" }
                    ].map((type) => (
                      <Button
                        key={type.value}
                        variant={selectedRecordType === type.value ? "default" : "outline"}
                        className="h-auto p-3 text-xs hover:bg-primary-light text-left transition-all"
                        onClick={() => setSelectedRecordType(type.value)}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>

                  {/* Search Form */}
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">
                          State *
                        </label>
                        <Select value={selectedState} onValueChange={(value) => {
                          setSelectedState(value);
                          setSelectedDistrict("all");
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="--Select State--" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All States</SelectItem>
                            {Object.entries(stateData).map(([code, data]) => (
                              <SelectItem key={code} value={code}>
                                {data.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium block mb-2">
                          District *
                        </label>
                        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                          <SelectTrigger>
                            <SelectValue placeholder="--Select District--" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                            {selectedState !== "all" && stateData[selectedState as keyof typeof stateData] && 
                              stateData[selectedState as keyof typeof stateData].districts.map((district) => (
                                <SelectItem key={district} value={district.toLowerCase().replace(/\s+/g, '_')}>
                                  {district}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Input 
                        placeholder="Survey Number" 
                        className="flex-1" 
                        value={surveyNumber}
                        onChange={(e) => setSurveyNumber(e.target.value)}
                      />
                      <Input 
                        placeholder="Mobile Number" 
                        className="flex-1" 
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Enter Captcha" 
                        className="flex-1" 
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                      />
                      <div className="w-20 h-10 bg-muted border rounded flex items-center justify-center text-sm font-mono">
                        {captchaValue}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gov-green hover:bg-gov-green/90"
                        onClick={handleSearch}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleReset}>
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card className="shadow-card mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Search Results ({searchResults.length} found)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4 bg-muted/50">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <h4 className="font-semibold text-sm">Holder Name</h4>
                            <p className="text-sm">{result.holderName}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Location</h4>
                            <p className="text-sm">{result.village}, {result.district}</p>
                            <p className="text-xs text-muted-foreground">{result.state}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Record Type</h4>
                            <Badge variant="outline">{result.recordType}</Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Status</h4>
                            <Badge variant={result.status === 'Approved' ? 'default' : 'secondary'}>
                              {result.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mt-3 pt-3 border-t">
                          <div>
                            <span className="text-sm font-medium">Area: </span>
                            <span className="text-sm">{result.area}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Survey No: </span>
                            <span className="text-sm">{result.surveyNo}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-center">
                    <Button variant="outline" size="sm">
                      Download Results as PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Interactive Forest Rights Atlas
                </CardTitle>
                <CardDescription>
                  Explore village-wise forest rights data with interactive mapping
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <MapViewer />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Scheme Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "PM-KISAN", value: 92 },
                      { name: "MGNREGA", value: 87 },
                      { name: "Van Dhan Vikas", value: 94 },
                      { name: "SBM-G", value: 78 }
                    ].map((scheme) => (
                      <div key={scheme.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{scheme.name}</span>
                          <span>{scheme.value}%</span>
                        </div>
                        <Progress value={scheme.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Impact Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Livelihood Improvement", value: "+23%", type: "success" },
                      { label: "Forest Cover Increase", value: "+12%", type: "primary" },
                      { label: "Income Increase", value: "+34%", type: "success" },
                      { label: "Fuel Wood Reduction", value: "-18%", type: "warning" }
                    ].map((metric) => (
                      <div key={metric.label} className="flex items-center justify-between">
                        <span className="text-sm">{metric.label}</span>
                        <Badge className={`bg-${metric.type}`}>{metric.value}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">247</div>
                    <div className="text-sm text-muted-foreground">Villages Monitored</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">15,847</div>
                    <div className="text-sm text-muted-foreground">Active Beneficiaries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">34</div>
                    <div className="text-sm text-muted-foreground">Pending Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/admin">
                <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Admin Panel</h3>
                    <p className="text-sm text-muted-foreground">
                      User management, system settings, and administrative controls
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dss">
                <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-success" />
                    <h3 className="font-semibold mb-2">Decision Support</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered recommendations and analytics for forest management
                    </p>
                  </CardContent>
                </Card>
              </Link>

            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Database Health</span>
                          <span>98.9%</span>
                        </div>
                        <Progress value={98.9} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>API Response Time</span>
                          <span>Fast</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Recent Actions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last Backup</span>
                        <span className="text-muted-foreground">2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Sync</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Scan</span>
                        <Badge variant="outline">Scheduled</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI HUB Tab */}
          <TabsContent value="demo" className="space-y-6">
            <UnifiedDashboard />
          </TabsContent>
        </Tabs>
      </div>


      {/* Government Departments Footer */}
      <footer className="bg-primary text-white py-8 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center gap-8 mb-6">
            {[
              { name: "Digital India", icon: Smartphone },
              { name: "MoTA", icon: Shield },
              { name: "Forest Survey", icon: TreePine },
              { name: "GIS Division", icon: MapPin },
              { name: "eGov Portal", icon: Database }
            ].map((dept, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <dept.icon className="w-8 h-8" />
                </div>
                <p className="text-xs">{dept.name}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center text-sm opacity-90 space-y-2">
            <p>{t("footer.developedUnder")}</p>
            <p>{t("footer.governmentCredits")}</p>
            <p>© 2025 Government of India. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;