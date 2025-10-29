import React, { useState } from 'react';
import { claimsAPI } from '../services/api';

export default function ClaimTracker({ language }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await claimsAPI.search(query);
      setResult(response.data);
    } catch (err) {
      setError(language === 'en' ? 'Failed to search claims' : 'दावे खोजने में असफल');
      // Mock data for demo
      setResult([
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
          created_at: '2024-01-15',
          updated_at: '2024-08-20'
        },
        {
          id: 2,
          claim_id: 'CG-002-2024',
          claimant_name: 'Sita Devi',
          claim_type: 'CR',
          status: 'PENDING',
          village: 'Bhelwa',
          district: 'Kondagaon',
          state: 'Chhattisgarh',
          area_ha: 2.1,
          created_at: '2024-02-10',
          updated_at: '2024-07-15'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      APPROVED: { color: 'bg-green-100 text-green-800', text: language === 'en' ? 'Approved' : 'स्वीकृत' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: language === 'en' ? 'Pending' : 'लंबित' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: language === 'en' ? 'Rejected' : 'अस्वीकृत' },
      UNDER_REVIEW: { color: 'bg-blue-100 text-blue-800', text: language === 'en' ? 'Under Review' : 'समीक्षाधीन' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Track Your Forest Rights Claim' : 'अपने वन अधिकार दावे को ट्रैक करें'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Search for your claim using Claim ID, your name, or village name to get the latest status updates.'
              : 'नवीनतम स्थिति अपडेट प्राप्त करने के लिए दावा ID, अपने नाम, या गांव के नाम का उपयोग करके अपना दावा खोजें।'
            }
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-lg"
              placeholder={language === 'en' 
                ? 'Enter Claim ID, Name, or Village...' 
                : 'दावा ID, नाम, या गांव दर्ज करें...'}
            />
            <button
              onClick={search}
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading 
                ? (language === 'en' ? 'Searching...' : 'खोज रहे हैं...') 
                : (language === 'en' ? 'Search' : 'खोजें')
              }
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Search Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">
            {language === 'en' ? 'Search Tips:' : 'खोज सुझाव:'}
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>
              {language === 'en' 
                ? '• Use exact Claim ID (e.g., CG-001-2024) for best results'
                : '• सर्वोत्तम परिणामों के लिए सटीक दावा ID (जैसे, CG-001-2024) का उपयोग करें'
              }
            </li>
            <li>
              {language === 'en' 
                ? '• Search by full name or village name'
                : '• पूरा नाम या गांव के नाम से खोजें'
              }
            </li>
            <li>
              {language === 'en' 
                ? '• Make sure spelling is correct'
                : '• सुनिश्चित करें कि वर्तनी सही है'
              }
            </li>
          </ul>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {language === 'en' ? 'Search Results' : 'खोज परिणाम'} ({result.length})
            </h2>
            
            {result.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'en' ? 'No Claims Found' : 'कोई दावा नहीं मिला'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' 
                    ? 'Please check your search terms and try again.'
                    : 'कृपया अपने खोज शब्दों की जांच करें और फिर से कोशिश करें।'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {result.map((claim) => (
                  <div key={claim.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {claim.claimant_name}
                          </h3>
                          <p className="text-gray-600">
                            {language === 'en' ? 'Claim ID:' : 'दावा ID:'} {claim.claim_id}
                          </p>
                        </div>
                        <div className="mt-2 lg:mt-0">
                          {getStatusBadge(claim.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            {language === 'en' ? 'Claim Type' : 'दावा प्रकार'}
                          </label>
                          <p className="text-gray-900 font-medium">{claim.claim_type}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            {language === 'en' ? 'Village' : 'गाँव'}
                          </label>
                          <p className="text-gray-900">{claim.village}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            {language === 'en' ? 'District' : 'जिला'}
                          </label>
                          <p className="text-gray-900">{claim.district}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            {language === 'en' ? 'State' : 'राज्य'}
                          </label>
                          <p className="text-gray-900">{claim.state}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            {language === 'en' ? 'Area (Hectares)' : 'क्षेत्रफल (हेक्टेयर)'}
                          </label>
                          <p className="text-gray-900 font-medium">{claim.area_ha} ha</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            {language === 'en' ? 'Date Filed' : 'दाखिल तिथि'}
                          </label>
                          <p className="text-gray-900">
                            {new Date(claim.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Timeline/Progress */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          {language === 'en' ? 'Progress Timeline' : 'प्रगति समयरेखा'}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">
                              {language === 'en' ? 'Filed' : 'दायर'}
                            </span>
                          </div>
                          <div className="flex-1 h-1 bg-gray-300 rounded-full">
                            <div 
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ 
                                width: claim.status === 'APPROVED' ? '100%' : 
                                       claim.status === 'UNDER_REVIEW' ? '66%' : '33%' 
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              claim.status === 'APPROVED' ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-gray-600">
                              {language === 'en' ? 'Completed' : 'पूर्ण'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {language === 'en' ? 'Last Updated:' : 'अंतिम अपडेट:'} {' '}
                          {new Date(claim.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'en' ? 'Need Help?' : 'सहायता चाहिए?'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {language === 'en' ? 'Contact Support' : 'सहायता संपर्क'}
              </h4>
              <p className="text-gray-600 text-sm mb-2">
                {language === 'en' 
                  ? 'For questions about your claim status or application process:'
                  : 'आपके दावे की स्थिति या आवेदन प्रक्रिया के बारे में प्रश्नों के लिए:'
                }
              </p>
              <p className="text-green-600 font-medium">support@drishti-gis.gov.in</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {language === 'en' ? 'Visit Local Office' : 'स्थानीय कार्यालय पर जाएं'}
              </h4>
              <p className="text-gray-600 text-sm">
                {language === 'en' 
                  ? 'Contact your District Collector office or local Forest Rights Committee for in-person assistance.'
                  : 'व्यक्तिगत सहायता के लिए अपने जिला कलेक्टर कार्यालय या स्थानीय वन अधिकार समिति से संपर्क करें।'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
