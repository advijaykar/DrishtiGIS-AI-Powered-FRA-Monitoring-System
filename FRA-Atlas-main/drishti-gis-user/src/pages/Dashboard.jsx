import React, { useState, useEffect } from 'react';
import ChartCard from '../components/ChartCard';
import { claimsAPI } from '../services/api';

export default function Dashboard({ language }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await claimsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Mock data for demo
      setStats({
        totalClaims: 12450,
        approvedClaims: 8230,
        pendingClaims: 3145,
        rejectedClaims: 1075,
        totalArea: 15678.5,
        villages: 2340,
        states: 4,
        districts: 45,
        monthlyTrends: [
          { month: 'Jan', claims: 890, approved: 650 },
          { month: 'Feb', claims: 920, approved: 720 },
          { month: 'Mar', claims: 1100, approved: 800 },
          { month: 'Apr', claims: 1250, approved: 950 },
          { month: 'May', claims: 1180, approved: 880 },
          { month: 'Jun', claims: 1300, approved: 1000 }
        ],
        stateWise: [
          { state: 'Chhattisgarh', claims: 4500 },
          { state: 'Jharkhand', claims: 3200 },
          { state: 'Odisha', claims: 2800 },
          { state: 'Telangana', claims: 1950 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart data configurations
  const statusChartData = stats ? {
    labels: [
      language === 'en' ? 'Approved' : 'स्वीकृत',
      language === 'en' ? 'Pending' : 'लंबित',
      language === 'en' ? 'Rejected' : 'अस्वीकृत'
    ],
    datasets: [{
      data: [stats.approvedClaims, stats.pendingClaims, stats.rejectedClaims],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
      borderWidth: 2,
    }]
  } : null;

  const monthlyTrendData = stats ? {
    labels: stats.monthlyTrends.map(item => item.month),
    datasets: [
      {
        label: language === 'en' ? 'Total Claims' : 'कुल दावे',
        data: stats.monthlyTrends.map(item => item.claims),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: language === 'en' ? 'Approved' : 'स्वीकृत',
        data: stats.monthlyTrends.map(item => item.approved),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      }
    ]
  } : null;

  const stateWiseData = stats ? {
    labels: stats.stateWise.map(item => item.state),
    datasets: [{
      label: language === 'en' ? 'Claims by State' : 'राज्यवार दावे',
      data: stats.stateWise.map(item => item.claims),
      backgroundColor: ['#3b82f6', '#f97316', '#22c55e', '#8b5cf6'],
      borderWidth: 1,
    }]
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Analytics Dashboard' : 'विश्लेषण डैशबोर्ड'}
          </h1>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Comprehensive insights and analytics on Forest Rights Act claims'
              : 'वन अधिकार अधिनियम दावों पर व्यापक अंतर्दृष्टि और विश्लेषण'
            }
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {language === 'en' ? 'Total Claims' : 'कुल दावे'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalClaims?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {language === 'en' ? 'Approved' : 'स्वीकृत'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.approvedClaims?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {language === 'en' ? 'Pending' : 'लंबित'}
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.pendingClaims?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {language === 'en' ? 'Total Area' : 'कुल क्षेत्र'}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.totalArea?.toLocaleString()} ha
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard
            title={language === 'en' ? 'Claims by Status' : 'स्थिति के अनुसार दावे'}
            type="doughnut"
            data={statusChartData}
            language={language}
          />

          <ChartCard
            title={language === 'en' ? 'Claims by State' : 'राज्यवार दावे'}
            type="bar"
            data={stateWiseData}
            language={language}
          />
        </div>

        {/* Monthly Trends */}
        <div className="mb-8">
          <ChartCard
            title={language === 'en' ? 'Monthly Claim Trends (2024)' : 'मासिक दावा रुझान (2024)'}
            type="line"
            data={monthlyTrendData}
            language={language}
          />
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'en' ? 'Coverage Statistics' : 'कवरेज आंकड़े'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {language === 'en' ? 'States Covered' : 'कवर किए गए राज्य'}
                </span>
                <span className="font-semibold">{stats?.states}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {language === 'en' ? 'Districts' : 'जिले'}
                </span>
                <span className="font-semibold">{stats?.districts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {language === 'en' ? 'Villages' : 'गाँव'}
                </span>
                <span className="font-semibold">{stats?.villages?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'en' ? 'Success Rate' : 'सफलता दर'}
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {stats ? Math.round((stats.approvedClaims / stats.totalClaims) * 100) : 0}%
              </div>
              <p className="text-gray-600">
                {language === 'en' ? 'Claims Approved' : 'दावे स्वीकृत'}
              </p>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: stats ? `${Math.round((stats.approvedClaims / stats.totalClaims) * 100)}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'en' ? 'Quick Actions' : 'त्वरित क्रियाएं'}
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-900">
                  {language === 'en' ? 'Export Report' : 'रिपोर्ट निर्यात'}
                </div>
                <div className="text-sm text-blue-600">
                  {language === 'en' ? 'Download detailed analytics' : 'विस्तृत विश्लेषण डाउनलोड करें'}
                </div>
              </button>
              <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="font-medium text-green-900">
                  {language === 'en' ? 'View Map' : 'मानचित्र देखें'}
                </div>
                <div className="text-sm text-green-600">
                  {language === 'en' ? 'Geographic visualization' : 'भौगोलिक दृश्यीकरण'}
                </div>
              </button>
              <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="font-medium text-purple-900">
                  {language === 'en' ? 'Track Claims' : 'दावे ट्रैक करें'}
                </div>
                <div className="text-sm text-purple-600">
                  {language === 'en' ? 'Search and monitor' : 'खोजें और निगरानी करें'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'en' ? 'Recent Activity' : 'हाल की गतिविधि'}
          </h3>
          <div className="space-y-4">
            {[
              { action: 'approved', claim: 'CG-1234-2024', time: '2 hours ago' },
              { action: 'submitted', claim: 'JH-5678-2024', time: '4 hours ago' },
              { action: 'reviewed', claim: 'OD-9012-2024', time: '6 hours ago' },
              { action: 'approved', claim: 'TS-3456-2024', time: '8 hours ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.action === 'approved' ? 'bg-green-500' : 
                  activity.action === 'submitted' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.claim}</span> was{' '}
                    <span className={`font-medium ${
                      activity.action === 'approved' ? 'text-green-600' : 
                      activity.action === 'submitted' ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {activity.action}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
