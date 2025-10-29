import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Users, TreePine, FileText, BarChart3, AlertTriangle } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";

const Village = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  // Mock village data
  const villageData = {
    id: "mp_001",
    name: "Patalkot",
    population: 1247,
    pattas: { granted: 89, pending: 23 },
    areas: { total: 313.4, cfr: 245.6, ifr: 67.8 },
    tribalGroup: "Bharia"
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/atlas">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("village.backToAtlas")}
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{villageData.name}</h1>
                <p className="text-sm text-muted-foreground">Madhya Pradesh</p>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{villageData.population}</p>
                  <p className="text-sm text-muted-foreground">{t("village.population")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{villageData.pattas.granted}</p>
                  <p className="text-sm text-muted-foreground">{t("village.pattasGranted")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TreePine className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{villageData.areas.total}</p>
                  <p className="text-sm text-muted-foreground">{t("village.totalArea")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{villageData.pattas.pending}</p>
                  <p className="text-sm text-muted-foreground">{t("village.pendingClaims")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">{t("village.villageDetails")}</h2>
            <p className="text-muted-foreground mb-6">
              Complete village analytics and DSS recommendations coming soon
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/atlas">{t("atlas.backToHome")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dss">{t("village.dssRecommendations")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Village;