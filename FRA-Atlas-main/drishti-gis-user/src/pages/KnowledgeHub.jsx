import React, { useState } from 'react';

export default function KnowledgeHub({ language }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: language === 'en' ? 'All Resources' : 'सभी संसाधन' },
    { id: 'fra-basics', name: language === 'en' ? 'FRA Basics' : 'एफआरए मूल बातें' },
    { id: 'claim-process', name: language === 'en' ? 'Claim Process' : 'दावा प्रक्रिया' },
    { id: 'legal', name: language === 'en' ? 'Legal Documents' : 'कानूनी दस्तावेज' },
    { id: 'guides', name: language === 'en' ? 'How-to Guides' : 'गाइड' },
    { id: 'faqs', name: language === 'en' ? 'FAQs' : 'सामान्य प्रश्न' }
  ];

  const resources = [
    {
      id: 1,
      title: language === 'en' ? 'Understanding Forest Rights Act 2006' : 'वन अधिकार अधिनियम 2006 को समझना',
      description: language === 'en' 
        ? 'Comprehensive overview of the Forest Rights Act and its implications for tribal communities.'
        : 'वन अधिकार अधिनियम और आदिवासी समुदायों के लिए इसके प्रभावों का व्यापक अवलोकन।',
      category: 'fra-basics',
      type: 'guide',
      downloadUrl: '#',
      viewUrl: '#',
      featured: true
    },
    {
      id: 2,
      title: language === 'en' ? 'Step-by-Step Claim Filing Process' : 'चरण-दर-चरण दावा दाखिल करने की प्रक्रिया',
      description: language === 'en'
        ? 'Detailed guide on how to file forest rights claims with required documents and procedures.'
        : 'आवश्यक दस्तावेजों और प्रक्रियाओं के साथ वन अधिकार दावे दाखिल करने का विस्तृत गाइड।',
      category: 'claim-process',
      type: 'tutorial',
      downloadUrl: '#',
      viewUrl: '#',
      featured: true
    },
    {
      id: 3,
      title: language === 'en' ? 'Individual Forest Rights (IFR) Guidelines' : 'व्यक्तिगत वन अधिकार (IFR) दिशानिर्देश',
      description: language === 'en'
        ? 'Complete guidelines for Individual Forest Rights claims and documentation requirements.'
        : 'व्यक्तिगत वन अधिकार दावों और प्रलेखन आवश्यकताओं के लिए पूर्ण दिशानिर्देश।',
      category: 'legal',
      type: 'document',
      downloadUrl: '#',
      viewUrl: '#',
      featured: false
    },
    {
      id: 4,
      title: language === 'en' ? 'Community Forest Rights (CFR) Manual' : 'सामुदायिक वन अधिकार (CFR) मैनुअल',
      description: language === 'en'
        ? 'Comprehensive manual for Community Forest Rights with case studies and examples.'
        : 'केस स्टडी और उदाहरणों के साथ सामुदायिक वन अधिकारों के लिए व्यापक मैनुअल।',
      category: 'legal',
      type: 'manual',
      downloadUrl: '#',
      viewUrl: '#',
      featured: false
    },
    {
      id: 5,
      title: language === 'en' ? 'Frequently Asked Questions' : 'अक्सर पूछे जाने वाले प्रश्न',
      description: language === 'en'
        ? 'Common questions and answers about forest rights claims and procedures.'
        : 'वन अधिकार दावों और प्रक्रियाओं के बारे में सामान्य प्रश्न और उत्तर।',
      category: 'faqs',
      type: 'faq',
      downloadUrl: '#',
      viewUrl: '#',
      featured: true
    },
    {
      id: 6,
      title: language === 'en' ? 'Document Checklist for Claims' : 'दावों के लिए दस्तावेज चेकलिस्ट',
      description: language === 'en'
        ? 'Essential document checklist required for different types of forest rights claims.'
        : 'विभिन्न प्रकार के वन अधिकार दावों के लिए आवश्यक दस्तावेज चेकलिस्ट।',
      category: 'guides',
      type: 'checklist',
      downloadUrl: '#',
      viewUrl: '#',
      featured: false
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredResources = resources.filter(resource => resource.featured);

  const getTypeIcon = (type) => {
    const icons = {
      guide: '📖',
      tutorial: '🎯',
      document: '📄',
      manual: '📋',
      faq: '❓',
      checklist: '✅'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Knowledge Hub' : 'ज्ञान केंद्र'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'en'
              ? 'Access comprehensive resources, guides, and documentation about Forest Rights Act and claim processes.'
              : 'वन अधिकार अधिनियम और दावा प्रक्रियाओं के बारे में व्यापक संसाधन, गाइड और प्रलेखन का उपयोग करें।'
            }
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={language === 'en' ? 'Search resources...' : 'संसाधन खोजें...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Featured Resources */}
        {selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {language === 'en' ? 'Featured Resources' : 'विशेष संसाधन'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="text-2xl mr-3">{getTypeIcon(resource.type)}</div>
                      <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        {language === 'en' ? 'Featured' : 'विशेष'}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {resource.description}
                    </p>
                    <div className="flex space-x-3">
                      <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        {language === 'en' ? 'View' : 'देखें'}
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                        {language === 'en' ? 'Download' : 'डाउनलोड'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'en' ? 'All Resources' : 'सभी संसाधन'} ({filteredResources.length})
            </h2>
          </div>

          {filteredResources.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'en' ? 'No Resources Found' : 'कोई संसाधन नहीं मिला'}
              </h3>
              <p className="text-gray-600">
                {language === 'en'
                  ? 'Try adjusting your search terms or category filter.'
                  : 'अपने खोज शब्दों या श्रेणी फिल्टर को समायोजित करने का प्रयास करें।'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="text-xl mr-3">{getTypeIcon(resource.type)}</div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {resource.title}
                        </h3>
                        {resource.featured && (
                          <div className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            {language === 'en' ? 'Featured' : 'विशेष'}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        {resource.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>
                          {language === 'en' ? 'Category:' : 'श्रेणी:'} {' '}
                          <span className="font-medium">
                            {categories.find(c => c.id === resource.category)?.name}
                          </span>
                        </span>
                        <span>
                          {language === 'en' ? 'Type:' : 'प्रकार:'} {' '}
                          <span className="font-medium capitalize">{resource.type}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-6">
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        {language === 'en' ? 'View' : 'देखें'}
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                        {language === 'en' ? 'Download' : 'डाउनलोड'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'en' ? 'Quick Links' : 'त्वरित लिंक'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="#"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="text-2xl mr-3">🏛️</div>
              <div>
                <div className="font-medium text-blue-900 group-hover:text-blue-800">
                  {language === 'en' ? 'Government Portal' : 'सरकारी पोर्टल'}
                </div>
                <div className="text-sm text-blue-600">
                  {language === 'en' ? 'Official FRA website' : 'आधिकारिक एफआरए वेबसाइट'}
                </div>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <div className="text-2xl mr-3">📞</div>
              <div>
                <div className="font-medium text-green-900 group-hover:text-green-800">
                  {language === 'en' ? 'Helpline' : 'हेल्पलाइन'}
                </div>
                <div className="text-sm text-green-600">
                  {language === 'en' ? 'Get support' : 'सहायता प्राप्त करें'}
                </div>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div className="text-2xl mr-3">👥</div>
              <div>
                <div className="font-medium text-purple-900 group-hover:text-purple-800">
                  {language === 'en' ? 'Community Forum' : 'समुदायिक मंच'}
                </div>
                <div className="text-sm text-purple-600">
                  {language === 'en' ? 'Join discussions' : 'चर्चा में शामिल हों'}
                </div>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
            >
              <div className="text-2xl mr-3">🎓</div>
              <div>
                <div className="font-medium text-orange-900 group-hover:text-orange-800">
                  {language === 'en' ? 'Training Center' : 'प्रशिक्षण केंद्र'}
                </div>
                <div className="text-sm text-orange-600">
                  {language === 'en' ? 'Learn more' : 'और जानें'}
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-green-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            {language === 'en' ? 'Need More Help?' : 'अधिक सहायता चाहिए?'}
          </h3>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Our support team is here to help you navigate the forest rights process and answer your questions.'
              : 'हमारी सहायता टीम वन अधिकार प्रक्रिया में आपका मार्गदर्शन करने और आपके प्रश्नों का उत्तर देने के लिए यहाँ है।'
            }
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:support@drishti-gis.gov.in"
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              {language === 'en' ? 'Email Support' : 'ईमेल सहायता'}
            </a>
            <button className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              {language === 'en' ? 'Live Chat' : 'लाइव चैट'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
