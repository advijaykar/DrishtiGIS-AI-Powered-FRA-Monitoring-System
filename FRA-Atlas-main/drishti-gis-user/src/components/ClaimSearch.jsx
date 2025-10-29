import React, { useState } from 'react';
import { claimsAPI } from '../services/api';

export default function ClaimSearch({ language = 'en', onResults, className = '' }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    claimType: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const states = ['Chhattisgarh', 'Jharkhand', 'Odisha', 'Telangana'];
  const claimTypes = ['IFR', 'CR', 'CFR'];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'];

  const handleSearch = async () => {
    if (!query.trim() && !Object.values(filters).some(f => f)) return;

    setLoading(true);

    try {
      const searchParams = {
        q: query,
        ...filters
      };

      const response = await claimsAPI.search(query, searchParams);
      
      if (onResults) {
        onResults(response.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Return mock data for demo
      const mockResults = [
        {
          id: 1,
          claim_id: 'CG-001-2024',
          claimant_name: 'Ramesh Kumar',
          claim_type: 'IFR',
          status: 'APPROVED',
          village: 'Bhelwa',
          district: 'Kondagaon',
          state: 'Chhattisgarh',
          area_ha: 1.5,
          created_at: '2024-01-15'
        }
      ].filter(claim => {
        return (!filters.state || claim.state === filters.state) &&
               (!filters.claimType || claim.claim_type === filters.claimType) &&
               (!filters.status || claim.status === filters.status);
      });

      if (onResults) {
        onResults(mockResults);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({
      state: '',
      district: '',
      claimType: '',
      status: ''
    });
    if (onResults) {
      onResults([]);
    }
  };

  const hasActiveFilters = query || Object.values(filters).some(f => f);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Main Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'en' 
              ? 'Enter Claim ID, Name, or Village...' 
              : 'दावा ID, नाम, या गांव दर्ज करें...'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {language === 'en' ? 'Searching...' : 'खोज रहे हैं...'}
              </div>
            ) : (
              language === 'en' ? 'Search' : 'खोजें'
            )}
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {language === 'en' ? 'Advanced Filters' : 'उन्नत फिल्टर'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
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
              <label className="block text-sm font-medium text-gray-600 mb-1">
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
              <label className="block text-sm font-medium text-gray-600 mb-1">
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
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                {language === 'en' ? 'Clear All' : 'सभी साफ़ करें'}
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-600 mr-2">
                {language === 'en' ? 'Active filters:' : 'सक्रिय फिल्टर:'}
              </span>
              {query && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {language === 'en' ? 'Query:' : 'क्वेरी:'} "{query}"
                  <button
                    onClick={() => setQuery('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.state && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {language === 'en' ? 'State:' : 'राज्य:'} {filters.state}
                  <button
                    onClick={() => handleFilterChange('state', '')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.claimType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {language === 'en' ? 'Type:' : 'प्रकार:'} {filters.claimType}
                  <button
                    onClick={() => handleFilterChange('claimType', '')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {language === 'en' ? 'Status:' : 'स्थिति:'} {filters.status}
                  <button
                    onClick={() => handleFilterChange('status', '')}
                    className="ml-1 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      <div className="text-sm text-gray-500 mt-4">
        <p>
          {language === 'en' 
            ? '💡 Tip: Use exact Claim ID for best results, or search by claimant name or village.'
            : '💡 सुझाव: सर्वोत्तम परिणामों के लिए सटीक दावा ID का उपयोग करें, या दावेदार के नाम या गांव से खोजें।'
          }
        </p>
      </div>
    </div>
  );
}
