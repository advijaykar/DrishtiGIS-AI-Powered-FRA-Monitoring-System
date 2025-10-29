export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN || '',
  INDIA_CENTER: [22.9734, 78.6569],
  DEFAULT_ZOOM: 6,
  
  // Claim type colors for map visualization
  CLAIM_COLORS: {
    IFR: '#3b82f6', // blue
    CR: '#f97316',  // orange
    CFR: '#22c55e', // green
  },
  
  // Status colors
  STATUS_COLORS: {
    PENDING: '#eab308',   // yellow
    APPROVED: '#22c55e',  // green
    REJECTED: '#ef4444',  // red
    UNDER_REVIEW: '#8b5cf6', // purple
  }
};
