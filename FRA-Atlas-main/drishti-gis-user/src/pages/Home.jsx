import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ChartCard from '../components/ChartCard';
import { claimsAPI } from '../services/api';

export default function Home({ language }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await claimsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Mock data for demo
      setStats({
        totalClaims: 12450,
        approvedClaims: 8230,
        pendingClaims: 3145,
        rejectedClaims: 1075,
        totalArea: 15678.5,
        villages: 2340,
        states: 4,
        districts: 45
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '🗺️',
      title: language === 'en' ? 'Interactive Atlas' : 'इंटरैक्टिव एटलस',
      description: language === 'en' 
        ? 'Explore forest rights claims on an interactive map with detailed village-level information.'
        : 'विस्तृत गांव-स्तरीय जानकारी के साथ इंटरैक्टिव मानचित्र पर वन अधिकार दावों का अन्वेषण करें।',
      link: '/atlas'
    },
    {
      icon: '📊',
      title: language === 'en' ? 'Track Claims' : 'दावे ट्रैक करें',
      description: language === 'en'
        ? 'Monitor the status of forest rights claims and get real-time updates.'
        : 'वन अधिकार दावों की स्थिति की निगरानी करें और रियल-टाइम अपडेट प्राप्त करें।',
      link: '/claim'
    },
    {
      icon: '📈',
      title: language === 'en' ? 'Analytics Dashboard' : 'विश्लेषण डैशबोर्ड',
      description: language === 'en'
        ? 'View comprehensive analytics and insights on claim processing and outcomes.'
        : 'दावा प्रसंस्करण और परिणामों पर व्यापक विश्लेषण और अंतर्दृष्टि देखें।',
      link: '/dashboard'
    },
    {
      icon: '📚',
      title: language === 'en' ? 'Knowledge Hub' : 'ज्ञान केंद्र',
      description: language === 'en'
        ? 'Access resources, guides, and documentation about forest rights and claims.'
        : 'वन अधिकारों और दावों के बारे में संसाधन, गाइड और प्रलेखन का उपयोग करें।',
      link: '/knowledge'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              {language === 'en' ? 'Drishti-GIS' : 'दृष्टि-जीआईएस'}
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              {language === 'en'
                ? 'Empowering forest communities through digital transparency. Track forest rights claims, explore interactive maps, and access comprehensive data insights.'
                : 'डिजिटल पारदर्शिता के माध्यम से वन समुदायों को सशक्त बनाना। वन अधिकार दावों को ट्रैक करें, इंटरैक्टिव मानचित्र देखें, और व्यापक डेटा अंतर्दृष्टि प्राप्त करें।'
              }
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/atlas"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {language === 'en' ? 'Explore Atlas' : 'एटलस देखें'}
              </Link>
              <Link
                to="/claim"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
              >
                {language === 'en' ? 'Track Claims' : 'दावे ट्रैक करें'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {language === 'en' ? 'Key Statistics' : 'मुख्य आंकड़े'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.totalClaims?.toLocaleString()}
                </div>
                <div className="text-gray-600">
                  {language === 'en' ? 'Total Claims' : 'कुल दावे'}
                </div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.approvedClaims?.toLocaleString()}
                </div>
                <div className="text-gray-600">
                  {language === 'en' ? 'Approved' : 'स्वीकृत'}
                </div>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {stats.pendingClaims?.toLocaleString()}
                </div>
                <div className="text-gray-600">
                  {language === 'en' ? 'Pending' : 'लंबित'}
                </div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {stats.totalArea?.toLocaleString()} ha
                </div>
                <div className="text-gray-600">
                  {language === 'en' ? 'Total Area' : 'कुल क्षेत्र'}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {language === 'en' ? 'Platform Features' : 'प्लेटफॉर्म की विशेषताएं'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-green-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-green-600 text-white rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'en' ? 'Need Help?' : 'सहायता चाहिए?'}
            </h2>
            <p className="text-xl mb-6">
              {language === 'en'
                ? 'Get assistance with your forest rights claims or explore our comprehensive knowledge base.'
                : 'अपने वन अधिकार दावों में सहायता प्राप्त करें या हमारे व्यापक ज्ञान आधार का अन्वेषण करें।'
              }
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/knowledge"
                className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {language === 'en' ? 'Knowledge Hub' : 'ज्ञान केंद्र'}
              </Link>
              <a
                href="mailto:support@drishti-gis.gov.in"
                className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
              >
                {language === 'en' ? 'Contact Support' : 'सहायता संपर्क'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
