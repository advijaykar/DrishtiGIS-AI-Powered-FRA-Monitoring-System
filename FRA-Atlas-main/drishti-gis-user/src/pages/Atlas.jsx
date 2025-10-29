import React, { useState } from 'react';
import MapViewer from '../components/MapViewer';

export default function Atlas({ language }) {
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    claimType: '',
    status: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const states = ['Chhattisgarh', 'Jharkhand', 'Odisha', 'Telangana'];
  const claimTypes = ['IFR', 'CR', 'CFR'];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      state: '',
      district: '',
      claimType: '',
      status: ''
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'en' ? 'FRA Atlas' : 'एफआरए एटलस'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {language === 'en' 
                ? 'Interactive map of Forest Rights Act claims across tribal states'
                : 'आदिवासी राज्यों में वन अधिकार अधिनियम दावों का इंटरैक्टिव मानचित्र'
              }
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>{language === 'en' ? 'Filters' : 'फिल्टर'}</span>
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>IFR</span>
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>CR</span>
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>CFR</span>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'State' : 'राज्य'}
                </label>
                <select
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">{language === 'en' ? 'All States' : 'सभी राज्य'}</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Claim Type' : 'दावा प्रकार'}
                </label>
                <select
                  value={filters.claimType}
                  onChange={(e) => handleFilterChange('claimType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">{language === 'en' ? 'All Types' : 'सभी प्रकार'}</option>
                  {claimTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Status' : 'स्थिति'}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">{language === 'en' ? 'All Status' : 'सभी स्थिति'}</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                >
                  {language === 'en' ? 'Reset' : 'रीसेट'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapViewer language={language} filters={filters} />
        
        {/* Floating Info Panel */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold text-sm mb-2">
            {language === 'en' ? 'Map Information' : 'मानचित्र जानकारी'}
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p>
              {language === 'en' 
                ? '• Click on claims to view details'
                : '• विवरण देखने के लिए दावों पर क्लिक करें'
              }
            </p>
            <p>
              {language === 'en' 
                ? '• Use layer controls to toggle overlays'
                : '• ओवरले टॉगल करने के लिए लेयर नियंत्रण का उपयोग करें'
              }
            </p>
            <p>
              {language === 'en' 
                ? '• IoT sensors show real-time environmental data'
                : 'IoT सेंसर वास्तविक समय पर्यावरणीय डेटा दिखाते हैं'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
