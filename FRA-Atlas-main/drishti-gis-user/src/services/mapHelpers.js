import L from 'leaflet';
import { config } from '../config';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
});

// Style functions for different claim types
export const getClaimStyle = (claimType, status) => {
  const baseColor = config.CLAIM_COLORS[claimType] || '#666666';
  const opacity = status === 'APPROVED' ? 0.8 : 0.5;
  
  return {
    fillColor: baseColor,
    color: baseColor,
    weight: 2,
    opacity: 0.8,
    fillOpacity: opacity,
  };
};

// Create custom marker icons
export const createCustomIcon = (type, color = '#22c55e') => {
  const iconHtml = getIconHtml(type, color);
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const getIconHtml = (type, color) => {
  const icons = {
    village: `<svg width="30" height="30" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 2L2 7L12 12L22 7L12 2M17 16L12 13.5L7 16V10.5L12 8L17 10.5V16Z"/>
    </svg>`,
    iot: `<svg width="20" height="20" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 2A10 10 0 0 0 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/>
    </svg>`,
    water: `<svg width="20" height="20" viewBox="0 0 24 24" fill="${color}">
      <path d="M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25S18,10 18,14A6,6 0 0,1 12,20Z"/>
    </svg>`
  };
  
  return `<div style="background: white; border-radius: 50%; padding: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${icons[type] || icons.village}</div>`;
};

// Bounds helper for India
export const getIndiaBounds = () => {
  return [
    [6.4627, 68.1097], // Southwest
    [35.5137, 97.4152]  // Northeast
  ];
};

// State bounds for focusing
export const getStateBounds = (stateName) => {
  const stateBounds = {
    'Chhattisgarh': [[17.7800, 80.0900], [24.0900, 84.4000]],
    'Jharkhand': [[21.9500, 83.3200], [25.3500, 87.5700]],
    'Odisha': [[17.7800, 81.3700], [22.5700, 87.5300]],
    'Telangana': [[15.7500, 77.2300], [19.9200, 81.1300]]
  };
  
  return stateBounds[stateName] || getIndiaBounds();
};

// Format coordinates for display
export const formatCoordinates = (lat, lng, precision = 4) => {
  return `${lat.toFixed(precision)}°, ${lng.toFixed(precision)}°`;
};

// Calculate area from polygon coordinates (approximate)
export const calculatePolygonArea = (coordinates) => {
  if (!coordinates || !coordinates[0] || coordinates[0].length < 3) {
    return 0;
  }
  
  // Simple approximation using shoelace formula
  const coords = coordinates[0];
  let area = 0;
  
  for (let i = 0; i < coords.length - 1; i++) {
    area += coords[i][0] * coords[i + 1][1];
    area -= coords[i + 1][0] * coords[i][1];
  }
  
  return Math.abs(area) / 2;
};

// Distance between two points (in km)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
