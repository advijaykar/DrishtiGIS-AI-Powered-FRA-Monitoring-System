import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Atlas from './pages/Atlas';
import ClaimTracker from './pages/ClaimTracker';
import Dashboard from './pages/Dashboard';
import KnowledgeHub from './pages/KnowledgeHub';

export default function App() {
  const [language, setLanguage] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const navigation = [
    { path: '/', name: language === 'en' ? 'Home' : 'होम', nameHi: 'होम' },
    { path: '/atlas', name: language === 'en' ? 'Atlas' : 'मानचित्र', nameHi: 'मानचित्र' },
    { path: '/claim', name: language === 'en' ? 'Claim Status' : 'दावा स्थिति', nameHi: 'दावा स्थिति' },
    { path: '/dashboard', name: language === 'en' ? 'Dashboard' : 'डैशबोर्ड', nameHi: 'डैशबोर्ड' },
    { path: '/knowledge', name: language === 'en' ? 'Knowledge Hub' : 'ज्ञान केंद्र', nameHi: 'ज्ञान केंद्र' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">
                Drishti-GIS | {language === 'en' ? 'FRA Atlas' : 'एफआरए एटलस'}
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-green-800 text-white'
                      : 'text-green-100 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded-md transition-colors"
              >
                {language === 'en' ? 'हिंदी' : 'English'}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-green-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-green-800 text-white'
                        : 'text-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home language={language} />} />
          <Route path="/atlas" element={<Atlas language={language} />} />
          <Route path="/claim" element={<ClaimTracker language={language} />} />
          <Route path="/dashboard" element={<Dashboard language={language} />} />
          <Route path="/knowledge" element={<KnowledgeHub language={language} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {language === 'en' ? 'About Drishti-GIS' : 'दृष्टि-जीआईएस के बारे में'}
              </h3>
              <p className="text-gray-300 text-sm">
                {language === 'en' 
                  ? 'Empowering forest communities through digital transparency and efficient claim management.'
                  : 'डिजिटल पारदर्शिता और कुशल दावा प्रबंधन के माध्यम से वन समुदायों को सशक्त बनाना।'
                }
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {language === 'en' ? 'Quick Links' : 'त्वरित लिंक'}
              </h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/atlas" className="text-gray-300 hover:text-white">
                  {language === 'en' ? 'FRA Atlas' : 'एफआरए एटलस'}
                </Link></li>
                <li><Link to="/claim" className="text-gray-300 hover:text-white">
                  {language === 'en' ? 'Track Claims' : 'दावे ट्रैक करें'}
                </Link></li>
                <li><Link to="/knowledge" className="text-gray-300 hover:text-white">
                  {language === 'en' ? 'Knowledge Hub' : 'ज्ञान केंद्र'}
                </Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {language === 'en' ? 'Contact' : 'संपर्क'}
              </h3>
              <p className="text-gray-300 text-sm">
                {language === 'en' ? 'For support and assistance' : 'सहायता और सहारे के लिए'}
              </p>
              <p className="text-gray-300 text-sm mt-2">support@drishti-gis.gov.in</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2024 Drishti-GIS. {language === 'en' ? 'All rights reserved.' : 'सभी अधिकार सुरक्षित।'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
