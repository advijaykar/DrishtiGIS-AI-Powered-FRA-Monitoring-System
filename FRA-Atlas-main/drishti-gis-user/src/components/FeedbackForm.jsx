import React, { useState } from 'react';
import { feedbackAPI } from '../services/api';

export default function FeedbackForm({ language = 'en', onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'general', label: language === 'en' ? 'General Inquiry' : 'सामान्य पूछताछ' },
    { value: 'technical', label: language === 'en' ? 'Technical Issue' : 'तकनीकी समस्या' },
    { value: 'claim', label: language === 'en' ? 'Claim Related' : 'दावा संबंधित' },
    { value: 'suggestion', label: language === 'en' ? 'Suggestion' : 'सुझाव' },
    { value: 'complaint', label: language === 'en' ? 'Complaint' : 'शिकायत' }
  ];

  const priorities = [
    { value: 'low', label: language === 'en' ? 'Low' : 'कम' },
    { value: 'medium', label: language === 'en' ? 'Medium' : 'मध्यम' },
    { value: 'high', label: language === 'en' ? 'High' : 'उच्च' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = language === 'en' ? 'Name is required' : 'नाम आवश्यक है';
    }

    if (!formData.email.trim()) {
      newErrors.email = language === 'en' ? 'Email is required' : 'ईमेल आवश्यक है';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = language === 'en' ? 'Email is invalid' : 'ईमेल अमान्य है';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = language === 'en' ? 'Subject is required' : 'विषय आवश्यक है';
    }

    if (!formData.message.trim()) {
      newErrors.message = language === 'en' ? 'Message is required' : 'संदेश आवश्यक है';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = language === 'en' 
        ? 'Message must be at least 10 characters' 
        : 'संदेश कम से कम 10 अक्षर का होना चाहिए';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await feedbackAPI.submit(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'general',
        subject: '',
        message: '',
        priority: 'medium'
      });

      if (onSuccess) {
        onSuccess(language === 'en' 
          ? 'Feedback submitted successfully!' 
          : 'फीडबैक सफलतापूर्वक सबमिट किया गया!'
        );
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setErrors({ 
        submit: language === 'en' 
          ? 'Failed to submit feedback. Please try again.' 
          : 'फीडबैक सबमिट करने में असफल। कृपया पुनः प्रयास करें।'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {language === 'en' ? 'Submit Feedback' : 'फीडबैक सबमिट करें'}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Name' : 'नाम'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'en' ? 'Enter your name' : 'अपना नाम दर्ज करें'}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Email' : 'ईमेल'} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'en' ? 'Enter your email' : 'अपना ईमेल दर्ज करें'}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Phone and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Phone (Optional)' : 'फोन (वैकल्पिक)'}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              placeholder={language === 'en' ? 'Enter your phone number' : 'अपना फोन नंबर दर्ज करें'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Category' : 'श्रेणी'}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Subject' : 'विषय'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'en' ? 'Brief subject of your feedback' : 'आपके फीडबैक का संक्षिप्त विषय'}
            />
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Priority' : 'प्राथमिकता'}
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Message' : 'संदेश'} <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className={`w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 resize-none ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={language === 'en' 
              ? 'Please provide details about your feedback...' 
              : 'कृपया अपने फीडबैक के बारे में विवरण प्रदान करें...'
            }
          />
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          <div className="text-right text-sm text-gray-500 mt-1">
            {formData.message.length}/1000
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {language === 'en' ? 'Submitting...' : 'सबमिट कर रहे हैं...'}
              </div>
            ) : (
              language === 'en' ? 'Submit Feedback' : 'फीडबैक सबमिट करें'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              {language === 'en' ? 'Cancel' : 'रद्द करें'}
            </button>
          )}
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800 text-sm">
          {language === 'en' 
            ? '💡 Your feedback helps us improve the Drishti-GIS platform. We typically respond within 2-3 business days.'
            : '💡 आपका फीडबैक हमें दृष्टि-जीआईएस प्लेटफॉर्म में सुधार करने में मदद करता है। हम आमतौर पर 2-3 कार्यदिवसों में जवाब देते हैं।'
          }
        </p>
      </div>
    </div>
  );
}
