import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { Layers, MapPin, Satellite, Map as MapIcon, Trees, Home, Waves } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Patta {
  id: string;
  holder_name: string;
  village: string;
  district: string;
  state: string;
  tribal_group: string;
  claim_type: 'individual' | 'community';
  land_area: number;
  coordinates: { x: number; y: number };
  status: 'pending' | 'approved' | 'rejected';
  assets?: Asset[];
}

interface Asset {
  id: string;
  asset_type: 'farmland' | 'water_body' | 'homestead' | 'forest' | 'pond';
  coordinates: { x: number; y: number };
  area: number;
  confidence_score: number;
  verified_by_user: boolean;
}

interface LayerState {
  pattas: boolean;
  assets: boolean;
  satellite: boolean;
  terrain: boolean;
}

interface FilterState {
  state: string;
  district: string;
  village: string;
  tribalGroup: string;
  claimType: string;
  status: string;
}

const BeforeAfterSlider: React.FC<{ beforeOpacity: number; onOpacityChange: (value: number) => void }> = ({
  beforeOpacity,
  onOpacityChange
}) => {
  return (
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-[1000]">
      <h4 className="font-semibold mb-2">Before/After Comparison</h4>
      <div className="flex items-center gap-2">
        <span className="text-xs">Before</span>
        <Slider
          value={[beforeOpacity]}
          onValueChange={(value) => onOpacityChange(value[0])}
          max={1}
          min={0}
          step={0.1}
          className="w-32"
        />
        <span className="text-xs">After</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Compare FRA potential vs granted titles
      </p>
    </div>
  );
};

const LayerControl: React.FC<{ layers: LayerState; onLayerToggle: (layer: keyof LayerState) => void }> = ({
  layers,
  onLayerToggle
}) => {
  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-[1000]">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Layers className="h-4 w-4" />
        Map Layers
      </h4>
      <div className="space-y-2">
        <Toggle pressed={layers.pattas} onPressedChange={() => onLayerToggle('pattas')} className="w-full justify-start">
          <MapPin className="h-4 w-4 mr-2" />
          FRA Pattas
        </Toggle>
        <Toggle pressed={layers.assets} onPressedChange={() => onLayerToggle('assets')} className="w-full justify-start">
          <Trees className="h-4 w-4 mr-2" />
          AI Assets
        </Toggle>
        <Toggle pressed={layers.satellite} onPressedChange={() => onLayerToggle('satellite')} className="w-full justify-start">
          <Satellite className="h-4 w-4 mr-2" />
          Satellite
        </Toggle>
        <Toggle pressed={layers.terrain} onPressedChange={() => onLayerToggle('terrain')} className="w-full justify-start">
          <MapIcon className="h-4 w-4 mr-2" />
          Terrain
        </Toggle>
      </div>
    </div>
  );
};

const FilterPanel: React.FC<{ filters: FilterState; onFilterChange: (filters: FilterState) => void }> = ({
  filters,
  onFilterChange
}) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Filter FRA Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Select value={filters.state} onValueChange={(value) => updateFilter('state', value)}>
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All States</SelectItem>
              <SelectItem value="West Bengal">West Bengal</SelectItem>
              <SelectItem value="Odisha">Odisha</SelectItem>
              <SelectItem value="Jharkhand">Jharkhand</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.district} onValueChange={(value) => updateFilter('district', value)}>
            <SelectTrigger>
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Districts</SelectItem>
              <SelectItem value="Alipurduar">Alipurduar</SelectItem>
              <SelectItem value="Jalpaiguri">Jalpaiguri</SelectItem>
              <SelectItem value="Cooch Behar">Cooch Behar</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.village} onValueChange={(value) => updateFilter('village', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Village" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Villages</SelectItem>
              <SelectItem value="Kumargram">Kumargram</SelectItem>
              <SelectItem value="Birpara">Birpara</SelectItem>
              <SelectItem value="Madarihat">Madarihat</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.tribalGroup} onValueChange={(value) => updateFilter('tribalGroup', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tribal Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Groups</SelectItem>
              <SelectItem value="Rajbanshi">Rajbanshi</SelectItem>
              <SelectItem value="Toto">Toto</SelectItem>
              <SelectItem value="Mech">Mech</SelectItem>
              <SelectItem value="Oraon">Oraon</SelectItem>
              <SelectItem value="Munda">Munda</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.claimType} onValueChange={(value) => updateFilter('claimType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Claim Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="community">Community</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export const SmartFRAAtlas: React.FC = () => {
  const [pattas, setPattas] = useState<Patta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatta, setSelectedPatta] = useState<Patta | null>(null);
  const [beforeOpacity, setBeforeOpacity] = useState(0.5);
  const [layers, setLayers] = useState<LayerState>({
    pattas: true,
    assets: true,
    satellite: false,
    terrain: false
  });
  const [filters, setFilters] = useState<FilterState>({
    state: '',
    district: '',
    village: '',
    tribalGroup: '',
    claimType: '',
    status: ''
  });

  useEffect(() => {
    console.log('SmartFRAAtlas: Component mounted, fetching pattas...');
    fetchPattas();
  }, [filters]);

  useEffect(() => {
    console.log('SmartFRAAtlas: Loading state:', loading);
    console.log('SmartFRAAtlas: Error state:', error);
    console.log('SmartFRAAtlas: Pattas count:', pattas.length);
  }, [loading, error, pattas]);

  const fetchPattas = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for demonstration
      const mockPattas: Patta[] = [
        {
          id: '1',
          holder_name: 'Ramesh Kumar',
          village: 'Kumargram',
          district: 'Alipurduar',
          state: 'West Bengal',
          tribal_group: 'Rajbanshi',
          claim_type: 'individual',
          land_area: 2.5,
          coordinates: { x: 89.1234, y: 26.5678 },
          status: 'approved',
          assets: [
            {
              id: 'asset1',
              asset_type: 'farmland',
              coordinates: { x: 89.1244, y: 26.5688 },
              area: 1.8,
              confidence_score: 0.92,
              verified_by_user: true
            },
            {
              id: 'asset2',
              asset_type: 'water_body',
              coordinates: { x: 89.1254, y: 26.5698 },
              area: 0.3,
              confidence_score: 0.87,
              verified_by_user: false
            }
          ]
        },
        {
          id: '2',
          holder_name: 'Sunita Devi',
          village: 'Birpara',
          district: 'Alipurduar',
          state: 'West Bengal',
          tribal_group: 'Toto',
          claim_type: 'community',
          land_area: 12.0,
          coordinates: { x: 89.2345, y: 26.4567 },
          status: 'pending',
          assets: [
            {
              id: 'asset3',
              asset_type: 'forest',
              coordinates: { x: 89.2355, y: 26.4577 },
              area: 8.5,
              confidence_score: 0.95,
              verified_by_user: true
            },
            {
              id: 'asset4',
              asset_type: 'homestead',
              coordinates: { x: 89.2365, y: 26.4587 },
              area: 0.5,
              confidence_score: 0.89,
              verified_by_user: false
            }
          ]
        },
        {
          id: '3',
          holder_name: 'Ajit Oraon',
          village: 'Madarihat',
          district: 'Alipurduar',
          state: 'West Bengal',
          tribal_group: 'Oraon',
          claim_type: 'individual',
          land_area: 4.2,
          coordinates: { x: 89.3456, y: 26.3456 },
          status: 'approved',
          assets: [
            {
              id: 'asset5',
              asset_type: 'pond',
              coordinates: { x: 89.3466, y: 26.3466 },
              area: 0.8,
              confidence_score: 0.91,
              verified_by_user: true
            }
          ]
        },
        {
          id: '4',
          holder_name: 'Birsa Munda',
          village: 'Kumargram',
          district: 'Alipurduar',
          state: 'West Bengal',
          tribal_group: 'Munda',
          claim_type: 'individual',
          land_area: 3.1,
          coordinates: { x: 89.4567, y: 26.2345 },
          status: 'rejected',
          assets: []
        }
      ];

      // Apply filters to mock data
      let filteredPattas = mockPattas;
      
      if (filters.state) {
        filteredPattas = filteredPattas.filter(p => p.state === filters.state);
      }
      if (filters.district) {
        filteredPattas = filteredPattas.filter(p => p.district === filters.district);
      }
      if (filters.village) {
        filteredPattas = filteredPattas.filter(p => p.village === filters.village);
      }
      if (filters.tribalGroup) {
        filteredPattas = filteredPattas.filter(p => p.tribal_group === filters.tribalGroup);
      }
      if (filters.claimType) {
        filteredPattas = filteredPattas.filter(p => p.claim_type === filters.claimType);
      }
      if (filters.status) {
        filteredPattas = filteredPattas.filter(p => p.status === filters.status);
      }

      setPattas(filteredPattas);
    } catch (error) {
      console.error('Error fetching pattas:', error);
      setError('Failed to load FRA data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLayerToggle = (layer: keyof LayerState) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const getMarkerIcon = (patta: Patta) => {
    const color = patta.status === 'approved' ? 'green' : 
                  patta.status === 'pending' ? 'orange' : 'red';
    const size = patta.claim_type === 'community' ? 'large' : 'medium';
    
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: ${size === 'large' ? '20px' : '15px'}; height: ${size === 'large' ? '20px' : '15px'}; border-radius: 50%; border: 2px solid white;"></div>`,
      className: 'custom-marker',
      iconSize: [size === 'large' ? 24 : 19, size === 'large' ? 24 : 19],
      iconAnchor: [size === 'large' ? 12 : 9.5, size === 'large' ? 12 : 9.5]
    });
  };

  const getAssetIcon = (asset: Asset) => {
    const icons = {
      farmland: '🌾',
      water_body: '💧',
      homestead: '🏠',
      forest: '🌲',
      pond: '🏊'
    };
    
    return L.divIcon({
      html: `<div style="font-size: 16px;">${icons[asset.asset_type]}</div>`,
      className: 'asset-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={() => fetchPattas()} className="mt-4">Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>Loading FRA Atlas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded">
        <p className="text-sm font-medium">FRA Atlas Loaded - {pattas.length} pattas found</p>
        <p className="text-xs text-gray-600">Map should render below</p>
      </div>
      
      <FilterPanel filters={filters} onFilterChange={setFilters} />
      
      <div className="relative h-[600px] bg-background rounded-lg overflow-hidden border">
        <MapContainer
          center={[26.5, 89.5]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          scrollWheelZoom={true}
        >
          {/* Base layers */}
          {layers.terrain && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              opacity={layers.satellite ? 1 - beforeOpacity : 1}
            />
          )}
          
          {layers.satellite && (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              opacity={beforeOpacity}
            />
          )}

          {/* Default layer if none selected */}
          {!layers.terrain && !layers.satellite && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          )}

          {/* Patta markers */}
          {layers.pattas && pattas.map(patta => (
            <Marker
              key={patta.id}
              position={[patta.coordinates.y, patta.coordinates.x]}
              icon={getMarkerIcon(patta)}
              eventHandlers={{
                click: () => setSelectedPatta(patta)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold">{patta.holder_name}</h4>
                  <p className="text-sm">{patta.village}, {patta.district}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={patta.status === 'approved' ? 'default' : 'secondary'}>
                      {patta.status}
                    </Badge>
                    <Badge variant="outline">
                      {patta.claim_type}
                    </Badge>
                  </div>
                  <p className="text-xs mt-1">
                    Area: {patta.land_area} hectares
                  </p>
                  <p className="text-xs">
                    Tribal Group: {patta.tribal_group}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Asset markers */}
          {layers.assets && pattas.map(patta => 
            patta.assets?.map(asset => (
              <Marker
                key={asset.id}
                position={[asset.coordinates.y, asset.coordinates.x]}
                icon={getAssetIcon(asset)}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold capitalize">{asset.asset_type.replace('_', ' ')}</h4>
                    <p className="text-sm">Area: {asset.area} hectares</p>
                    <p className="text-sm">Confidence: {(asset.confidence_score * 100).toFixed(1)}%</p>
                    <div className="flex items-center gap-1 mt-2">
                      {asset.verified_by_user ? (
                        <Badge variant="default">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">AI Detected</Badge>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )) || []
          )}
        </MapContainer>

        <LayerControl layers={layers} onLayerToggle={handleLayerToggle} />
        
        {(layers.satellite && layers.terrain) && (
          <BeforeAfterSlider 
            beforeOpacity={beforeOpacity} 
            onOpacityChange={setBeforeOpacity} 
          />
        )}

        {/* Statistics overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <h4 className="font-semibold mb-2">FRA Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Pattas:</span>
              <span className="ml-2 font-medium">{pattas.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Approved:</span>
              <span className="ml-2 font-medium text-green-600">
                {pattas.filter(p => p.status === 'approved').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Individual:</span>
              <span className="ml-2 font-medium">
                {pattas.filter(p => p.claim_type === 'individual').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Community:</span>
              <span className="ml-2 font-medium">
                {pattas.filter(p => p.claim_type === 'community').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected patta details */}
      {selectedPatta && (
        <Card>
          <CardHeader>
            <CardTitle>Patta Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-semibold">Holder</h4>
                <p>{selectedPatta.holder_name}</p>
              </div>
              <div>
                <h4 className="font-semibold">Location</h4>
                <p>{selectedPatta.village}, {selectedPatta.district}</p>
              </div>
              <div>
                <h4 className="font-semibold">Land Area</h4>
                <p>{selectedPatta.land_area} hectares</p>
              </div>
              <div>
                <h4 className="font-semibold">Status</h4>
                <Badge variant={selectedPatta.status === 'approved' ? 'default' : 'secondary'}>
                  {selectedPatta.status}
                </Badge>
              </div>
            </div>
            
            {selectedPatta.assets && selectedPatta.assets.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">AI-Detected Assets</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPatta.assets.map(asset => (
                    <div key={asset.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="capitalize">{asset.asset_type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{asset.area} ha</span>
                        <Badge variant="outline" className="text-xs">
                          {(asset.confidence_score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};