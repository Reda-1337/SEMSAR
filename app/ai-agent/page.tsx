'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyPreferences } from '../utils/gemini';

export default function AIAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<PropertyPreferences>({
    location: '',
    budget: {
      min: 100000,
      max: 500000,
    },
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'House',
    mustHaveFeatures: [],
    preferredFeatures: [],
    timeframe: 'Within 3 months',
    additionalInfo: '',
    language: 'en', // Default language is English
  });

  // Property types
  const propertyTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Mobile Home', 'Land'];
  
  // Common features
  const commonFeatures = [
    'Garage', 'Garden', 'Pool', 'Basement', 'Balcony', 'Fireplace',
    'Air Conditioning', 'Furnished', 'Elevator', 'Gym', 'Security System',
    'Waterfront', 'Mountain View', 'Pets Allowed', 'Wheelchair Access'
  ];

  // Language options
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'fr', label: 'Français (French)' }
  ];

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'minBudget') {
      setPreferences(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          min: parseInt(value) || 0
        }
      }));
    } else if (name === 'maxBudget') {
      setPreferences(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          max: parseInt(value) || 0
        }
      }));
    } else if (name === 'bedrooms' || name === 'bathrooms') {
      setPreferences(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle checkbox changes for features
  const handleFeatureToggle = (feature: string, type: 'must' | 'preferred') => {
    if (type === 'must') {
      if (preferences.mustHaveFeatures.includes(feature)) {
        setPreferences(prev => ({
          ...prev,
          mustHaveFeatures: prev.mustHaveFeatures.filter(f => f !== feature)
        }));
      } else {
        setPreferences(prev => ({
          ...prev,
          mustHaveFeatures: [...prev.mustHaveFeatures, feature]
        }));
      }
    } else {
      if (preferences.preferredFeatures.includes(feature)) {
        setPreferences(prev => ({
          ...prev,
          preferredFeatures: prev.preferredFeatures.filter(f => f !== feature)
        }));
      } else {
        setPreferences(prev => ({
          ...prev,
          preferredFeatures: [...prev.preferredFeatures, feature]
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate location field
    if (!preferences.location || preferences.location.trim() === '') {
      alert("Please enter a location. This is required for property recommendations.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Store preferences in localStorage for the results page
      localStorage.setItem('propertyPreferences', JSON.stringify(preferences));
      
      // Navigate to the results page
      router.push('/ai-agent/results');
    } catch (error) {
      console.error('Error submitting preferences:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Next step
  const goToNextStep = () => {
    setStep(prevStep => prevStep + 1);
  };

  // Previous step
  const goToPreviousStep = () => {
    setStep(prevStep => prevStep - 1);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AI Home Finder</h1>
      <p className="mb-6">
        Tell us about your dream home and our AI will find the perfect match for you. The more details you provide, the better our recommendations will be.
      </p>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Step {step} of 3</h2>
            <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              
              <div className="border-l-4 border-blue-500 pl-4 pb-4 bg-blue-50 rounded-r p-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={preferences.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="City, neighborhood, or zip code (required)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This field is required for the AI to generate property recommendations.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Budget
                  </label>
                  <input
                    type="number"
                    name="minBudget"
                    value={preferences.budget.min}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Budget
                  </label>
                  <input
                    type="number"
                    name="maxBudget"
                    value={preferences.budget.max}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    name="bedrooms"
                    value={preferences.bedrooms}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'bedroom' : 'bedrooms'}
                      </option>
                    ))}
                    <option value="7">7+ bedrooms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <select
                    name="bathrooms"
                    value={preferences.bathrooms}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'bathroom' : 'bathrooms'}
                      </option>
                    ))}
                    <option value="5">4.5+ bathrooms</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={preferences.propertyType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeframe
                </label>
                <select
                  name="timeframe"
                  value={preferences.timeframe}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Immediately">Immediately</option>
                  <option value="Within 1 month">Within 1 month</option>
                  <option value="Within 3 months">Within 3 months</option>
                  <option value="Within 6 months">Within 6 months</option>
                  <option value="Next year">Next year</option>
                  <option value="Just browsing">Just browsing</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Must-Have Features */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Must-Have Features</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select features that are absolutely necessary for your new home.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {commonFeatures.map(feature => (
                  <div key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`must-${feature}`}
                      checked={preferences.mustHaveFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature, 'must')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor={`must-${feature}`} className="ml-2 text-sm">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-4">Preferred Features</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select features that you would like but are not essential.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {commonFeatures.map(feature => (
                  <div key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`preferred-${feature}`}
                      checked={preferences.preferredFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature, 'preferred')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor={`preferred-${feature}`} className="ml-2 text-sm">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Additional Information */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Additional Information</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide any other details that might help our AI find your perfect home.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Details
                </label>
                <textarea
                  name="additionalInfo"
                  value={preferences.additionalInfo}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows={5}
                  placeholder="Example: I need a home office space, I want to be close to schools, I prefer a quiet neighborhood, etc."
                ></textarea>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Language
                </label>
                <select
                  name="language"
                  value={preferences.language}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Select your preferred language for AI recommendations and communication.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Find My Dream Home'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 