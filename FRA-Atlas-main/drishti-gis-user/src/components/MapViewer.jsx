import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { atlasAPI, iotAPI } from '../services/api';
import { config } from '../config';
import { getClaimStyle, createCustomIcon } from '../services/mapHelpers';

const { BaseLayer, Overlay } = LayersControl;

export default function MapViewer({ language = 'en' }) {
  const [layers, setLayers] = useState({
    villages: null,
    claims: null,
    iotDevices: null
  });
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
  const mapRef = useRef();

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      const [layersResponse, iotResponse] = await Promise.all([
        atlasAPI.getLayers().catch(err => ({ data: { villages: mockVillagesData } })),
        iotAPI.getLatestReadings().catch(err => ({ data: mockIoTData }))
      ]);

      setLayers({
        villages: layersResponse.data.villages,
        claims: layersResponse.data.claims || mockClaimsData,
        iotDevices: iotResponse.data
      });
    } catch (error) {
      console.error('Failed to fetch map data:', error);
      // Use mock data
      setLayers({
        villages: mockVillagesData,
        claims: mockClaimsData,
        iotDevices: mockIoTData
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimClick = (feature, layer) => {
    setSelectedClaim(feature.properties);
    layer.openPopup();
  };

  const getPopupContent = (properties) => {
    return `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${properties.claimant_name}</h3>
        <div class="space-y-1 text-sm">
          <p><strong>${language === 'en' ? 'Claim ID' : 'दावा ID'}:</strong> ${properties.claim_id}</p>
          <p><strong>${language === 'en' ? 'Type' : 'प्रकार'}:</strong> ${properties.claim_type}</p>
          <p><strong>${language === 'en' ? 'Status' : 'स्थिति'}:</strong> 
            <span class="inline-block px-2 py-1 rounded text-xs font-medium ml-1
              ${properties.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                properties.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}">
              ${properties.status}
            </span>
          </p>
          <p><strong>${language === 'en' ? 'Village' : 'गाँव'}:</strong> ${properties.village}</p>
          <p><strong>${language === 'en' ? 'Area' : 'क्षेत्रफल'}:</strong> ${properties.area_ha} ha</p>
          <p><strong>${language === 'en' ? 'Date Filed' : 'दाखिल तिथि'}:</strong> ${new Date(properties.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    `;
  };

  const claimStyle = (feature) => {
    return getClaimStyle(feature.properties.claim_type, feature.properties.status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        center={config.INDIA_CENTER}
        zoom={config.DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <LayersControl position="topright">
          {/* Base Layers */}
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          
          {config.MAPBOX_TOKEN && (
            <BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${config.MAPBOX_TOKEN}`}
                tileSize={512}
                zoomOffset={-1}
              />
            </BaseLayer>
          )}

          {/* Overlay Layers */}
          {layers.villages && (
            <Overlay checked name={language === 'en' ? 'Villages' : 'गाँव'}>
              <GeoJSON
                data={layers.villages}
                style={{ color: '#666', weight: 1, fillOpacity: 0.1 }}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`
                    <div class="p-2">
                      <h3 class="font-bold">${feature.properties.name}</h3>
                      <p class="text-sm">${language === 'en' ? 'Village' : 'गाँव'}</p>
                    </div>
                  `);
                }}
              />
            </Overlay>
          )}

          {layers.claims && (
            <Overlay checked name={language === 'en' ? 'Forest Rights Claims' : 'वन अधिकार दावे'}>
              <GeoJSON
                data={layers.claims}
                style={claimStyle}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(getPopupContent(feature.properties));
                  layer.on('click', () => handleClaimClick(feature, layer));
                }}
              />
            </Overlay>
          )}

          {layers.iotDevices && (
            <Overlay name={language === 'en' ? 'IoT Sensors' : 'IoT सेंसर'}>
              <>
                {layers.iotDevices.map((device, index) => (
                  <Marker
                    key={index}
                    position={[device.lat, device.lng]}
                    icon={createCustomIcon('iot', device.status === 'active' ? '#22c55e' : '#ef4444')}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold">{device.name}</h3>
                        <p className="text-sm">
                          <strong>{language === 'en' ? 'Type' : 'प्रकार'}:</strong> {device.type}
                        </p>
                        <p className="text-sm">
                          <strong>{language === 'en' ? 'Status' : 'स्थिति'}:</strong> {device.status}
                        </p>
                        <p className="text-sm">
                          <strong>{language === 'en' ? 'Last Reading' : 'अंतिम रीडिंग'}:</strong> {device.lastReading}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            </Overlay>
          )}
        </LayersControl>

        {/* Custom Controls */}
        {showLegend && (
          <div className="leaflet-bottom leaflet-left">
            <div className="leaflet-control leaflet-bar bg-white p-4 rounded-lg shadow-lg">
              <h4 className="font-semibold mb-2">
                {language === 'en' ? 'Legend' : 'किंवदंती'}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: config.CLAIM_COLORS.IFR, opacity: 0.7 }}></div>
                  <span>IFR Claims</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: config.CLAIM_COLORS.CR, opacity: 0.7 }}></div>
                  <span>CR Claims</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: config.CLAIM_COLORS.CFR, opacity: 0.7 }}></div>
                  <span>CFR Claims</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-1000">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="bg-white px-3 py-2 rounded-lg shadow-md text-sm hover:bg-gray-50 transition-colors"
        >
          {showLegend ? '🗂️' : '📊'} {language === 'en' ? 'Legend' : 'किंवदंती'}
        </button>
      </div>
    </div>
  );
}

// Mock data for demonstration
const mockVillagesData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Bhelwa', district: 'Kondagaon', state: 'Chhattisgarh' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[81.5, 20.0], [81.6, 20.0], [81.6, 20.1], [81.5, 20.1], [81.5, 20.0]]]
      }
    }
  ]
};

const mockClaimsData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        claim_id: 'CG-001-2024',
        claimant_name: 'Ramesh Kumar',
        claim_type: 'IFR',
        status: 'APPROVED',
        village: 'Bhelwa',
        area_ha: 1.5,
        created_at: '2024-01-15'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[81.52, 20.02], [81.54, 20.02], [81.54, 20.04], [81.52, 20.04], [81.52, 20.02]]]
      }
    }
  ]
};

const mockIoTData = [
  {
    name: 'Soil Sensor 001',
    type: 'Soil Moisture',
    lat: 20.03,
    lng: 81.53,
    status: 'active',
    lastReading: '45% moisture'
  },
  {
    name: 'Water Level 001',
    type: 'Water Level',
    lat: 20.05,
    lng: 81.55,
    status: 'active',
    lastReading: '2.3m depth'
  }
];
