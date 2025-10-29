import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, TreePine, Layers, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/dist/images/marker-shadow.png",
});

// Mock village data for FRA Atlas
const mockVillages = [
  {
    id: "mp_001",
    name: "Patalkot",
    nameLocal: "पातालकोट",
    state: "Madhya Pradesh",
    stateLocal: "मध्य प्रदेश",
    district: "Chhindwara",
    districtLocal: "छिंदवाड़ा",
    population: 1247,
    pattas_granted: 89,
    cfr_area: 245.6,
    ifr_area: 67.8,
    tribal_group: "Bharia",
    coordinates: [22.0697, 78.9629] as [number, number],
    priority: "high"
  },
  {
    id: "od_001",
    name: "Similiguda",
    nameLocal: "ସିମିଲୀଗୁଡା",
    state: "Odisha",
    stateLocal: "ଓଡ଼ିଶା",
    district: "Koraput",
    districtLocal: "କୋରାପୁଟ",
    population: 2156,
    pattas_granted: 134,
    cfr_area: 412.3,
    ifr_area: 89.1,
    tribal_group: "Kondh",
    coordinates: [18.6298, 82.8077] as [number, number],
    priority: "high"
  },
  {
    id: "te_001",
    name: "Eturnagaram",
    nameLocal: "ఎతుర్నగరం",
    state: "Telangana",
    stateLocal: "తెలంగాణ",
    district: "Mulugu",
    districtLocal: "మూలుగు",
    population: 1543,
    pattas_granted: 98,
    cfr_area: 334.7,
    ifr_area: 78.3,
    tribal_group: "Koya",
    coordinates: [18.3222, 80.1636] as [number, number],
    priority: "medium"
  },
  {
    id: "tr_001", 
    name: "Kanchanpur",
    nameLocal: "কাঞ্চনপুর",
    state: "Tripura",
    stateLocal: "ত্রিপুরা",
    district: "North Tripura",
    districtLocal: "উত্তর ত্রিপুরা",
    population: 876,
    pattas_granted: 56,
    cfr_area: 178.9,
    ifr_area: 45.2,
    tribal_group: "Tripuri",
    coordinates: [24.1947, 92.0789] as [number, number],
    priority: "low"
  }
];

interface MapViewerProps {
  className?: string;
}

const MapViewer = ({ className }: MapViewerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<typeof mockVillages[0] | null>(null);
  const [layerControlOpen, setLayerControlOpen] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    villages: true,
    cfr: true,
    ifr: true,
    satellite: false,
    webgis: false
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: false // We'll add custom controls
    });

    // Add custom zoom control
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Add base tile layers
    const baseLayers = {
      openstreetmap: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
      }),
      webgis: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; WebGIS Services | Forest Rights Atlas',
        maxZoom: 19
      })
    };

    // Add default layer
    baseLayers.openstreetmap.addTo(map);

    // Store layers for switching
    mapInstanceRef.current = map;
    (mapInstanceRef.current as any).baseLayers = baseLayers;

    // Custom marker icons based on priority
    const getMarkerIcon = (priority: string, pattas: number) => {
      const color = priority === 'high' ? '#28a745' : 
                   priority === 'medium' ? '#ffc107' : '#dc3545';
      
      return L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${pattas}
          </div>
        `,
        className: 'custom-village-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    };

    // Add village markers
    mockVillages.forEach(village => {
      const marker = L.marker(village.coordinates, {
        icon: getMarkerIcon(village.priority, village.pattas_granted)
      }).addTo(map);

      // Create popup content
      const popupContent = `
        <div class="p-3 min-w-[280px]">
          <h3 class="font-semibold text-lg mb-1">${village.name}</h3>
          <p class="text-sm text-gray-600 mb-1">${village.nameLocal}</p>
          <p class="text-sm text-gray-600 mb-3">${village.district}, ${village.state}</p>
          
          <div class="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div><strong>${t('village.population')}:</strong> ${village.population.toLocaleString()}</div>
            <div><strong>Pattas:</strong> ${village.pattas_granted}</div>
            <div><strong>CFR:</strong> ${village.cfr_area} ha</div>
            <div><strong>IFR:</strong> ${village.ifr_area} ha</div>
          </div>
          
          <div class="mb-3">
            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              ${village.tribal_group} ${t('village.tribalGroup')}
            </span>
          </div>
          
          <button onclick="window.location.href='/village/${village.id}'" 
                  class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
            ${t('village.villageDetails')}
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Handle marker click
      marker.on('click', () => {
        setSelectedVillage(village);
      });
    });

    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [t]);

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));

    // Handle base layer switching
    if (mapInstanceRef.current && (mapInstanceRef.current as any).baseLayers) {
      const baseLayers = (mapInstanceRef.current as any).baseLayers;
      
      if (layer === 'satellite') {
        mapInstanceRef.current.eachLayer((mapLayer) => {
          if (mapLayer instanceof L.TileLayer) {
            mapInstanceRef.current!.removeLayer(mapLayer);
          }
        });
        
        if (!visibleLayers.satellite) {
          baseLayers.satellite.addTo(mapInstanceRef.current);
        } else {
          baseLayers.openstreetmap.addTo(mapInstanceRef.current);
        }
      }
      
      if (layer === 'webgis') {
        mapInstanceRef.current.eachLayer((mapLayer) => {
          if (mapLayer instanceof L.TileLayer) {
            mapInstanceRef.current!.removeLayer(mapLayer);
          }
        });
        
        if (!visibleLayers.webgis) {
          baseLayers.webgis.addTo(mapInstanceRef.current);
        } else {
          baseLayers.openstreetmap.addTo(mapInstanceRef.current);
        }
      }
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-map" />

      {/* Google Maps Style Layer Control */}
      <div className="absolute top-4 right-4 z-[1000]">
        {/* Layer Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          className="mb-2 bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white border-gray-200"
          onClick={() => setLayerControlOpen(!layerControlOpen)}
        >
          <Layers className="w-4 h-4" />
        </Button>

        {/* Layer Control Panel */}
        {layerControlOpen && (
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-gray-200 min-w-[200px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Map Layers
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLayerControlOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="border-b pb-2 mb-2">
                  <p className="text-xs font-medium text-gray-600 mb-2">Base Maps</p>
                  <Button
                    variant={!visibleLayers.satellite && !visibleLayers.webgis ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start text-xs mb-1"
                    onClick={() => {
                      if (visibleLayers.satellite) toggleLayer('satellite');
                      if (visibleLayers.webgis) toggleLayer('webgis');
                    }}
                  >
                    <MapPin className="w-3 h-3 mr-2" />
                    Street Map
                  </Button>
                  <Button
                    variant={visibleLayers.satellite ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start text-xs mb-1"
                    onClick={() => toggleLayer('satellite')}
                  >
                    <Navigation className="w-3 h-3 mr-2" />
                    Satellite
                  </Button>
                  <Button
                    variant={visibleLayers.webgis ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => toggleLayer('webgis')}
                  >
                    <Layers className="w-3 h-3 mr-2" />
                    WebGIS Data
                  </Button>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Data Layers</p>
                  <Button
                    variant={visibleLayers.villages ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start text-xs mb-1"
                    onClick={() => toggleLayer('villages')}
                  >
                    <Users className="w-3 h-3 mr-2" />
                    {t('common.village')}s
                  </Button>
                  <Button
                    variant={visibleLayers.cfr ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start text-xs mb-1"
                    onClick={() => toggleLayer('cfr')}
                  >
                    <TreePine className="w-3 h-3 mr-2" />
                    CFR Areas
                  </Button>
                  <Button
                    variant={visibleLayers.ifr ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => toggleLayer('ifr')}
                  >
                    <MapPin className="w-3 h-3 mr-2" />
                    IFR Areas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Map Legend */}
      <Card className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Village Priority</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>High (100+ pattas)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Medium (50-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Low (&lt;50)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Village Info Panel */}
      {selectedVillage && (
        <Card className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm max-w-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{selectedVillage.name}</div>
                <div className="text-xs text-muted-foreground">{selectedVillage.nameLocal}</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedVillage(null)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>{t('village.population')}:</span>
                <span className="font-medium">{selectedVillage.population.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Pattas:</span>
                <span className="font-medium text-green-600">{selectedVillage.pattas_granted}</span>
              </div>
              <div className="flex justify-between">
                <span>CFR Area:</span>
                <span className="font-medium">{selectedVillage.cfr_area} ha</span>
              </div>
              <Badge variant="outline" className="w-full justify-center mt-2">
                <TreePine className="w-3 h-3 mr-1" />
                {selectedVillage.tribal_group}
              </Badge>
              <Link to={`/village/${selectedVillage.id}`}>
                <Button size="sm" className="w-full mt-2">
                  {t('village.villageDetails')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapViewer;