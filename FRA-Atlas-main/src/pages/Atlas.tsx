import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import MapViewer from "@/components/MapViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Settings, ArrowLeft, Satellite, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const Atlas = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedLayer, setSelectedLayer] = useState("all");

  const states = [
    { value: "all", label: t("common.select") + " " + t("common.state") },
    { value: "mp", label: t("states.mp") },
    { value: "odisha", label: t("states.odisha") },
    { value: "telangana", label: t("states.telangana") },
    { value: "tripura", label: t("states.tripura") }
  ];

  const layers = [
    { value: "all", label: "All Layers" },
    { value: "villages", label: t("common.village") },
    { value: "cfr", label: "CFR Areas" },
    { value: "ifr", label: "IFR Areas" },
    { value: "pattas", label: "Pattas" },
    { value: "alerts", label: "Live Alerts" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("atlas.backToHome")}
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("atlas.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("atlas.subtitle")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="success" className="bg-success/10 text-success">
                <Satellite className="w-3 h-3 mr-1" />
                {t("atlas.liveData")}
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                {t("atlas.export")}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <LanguageSelector variant="compact" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-80 bg-card border-r shadow-sm overflow-y-auto custom-scrollbar"
        >
          <div className="p-6 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("common.search")} {t("common.village")}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={`${t("common.search")} by name, ${t("common.district")}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("common.state")}</label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Map Layers</label>
                  <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {layers.map((layer) => (
                        <SelectItem key={layer.value} value={layer.value}>
                          {layer.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full">
                  Apply Filters
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("landing.totalVillages")}</span>
                  <Badge variant="secondary">50,247</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Pattas</span>
                  <Badge variant="secondary">125,089</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CFR Area (Ha)</span>
                  <Badge variant="secondary">2.5M</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Live Alerts</span>
                  <Badge variant="destructive">23</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Deforestation Alert</span>
                    <Badge variant="destructive" className="text-xs">High</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Patalkot, MP - 15% change detected</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Water Index Change</span>
                    <Badge variant="warning" className="text-xs">Medium</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Similiguda, Odisha - Water body detected</p>
                  <p className="text-xs text-muted-foreground mt-1">6 hours ago</p>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.aside>

        {/* Main Map Area */}
        <main className="flex-1 relative">
          <MapViewer className="w-full h-full" />
        </main>
      </div>
    </div>
  );
};

export default Atlas;