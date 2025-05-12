'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PropertyPreferences, 
  AIAgentResponse, 
  PropertyRecommendation,
  initializeGemini,
  generatePropertyRecommendations 
} from '../../utils/gemini';

export default function AIAgentResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PropertyPreferences | null>(null);
  const [results, setResults] = useState<AIAgentResponse | null>(null);

  useEffect(() => {
    // Get preferences from localStorage
    const storedPreferences = localStorage.getItem('propertyPreferences');
    
    if (!storedPreferences) {
      setError('No preferences found. Please go back and fill out the form.');
      setIsLoading(false);
      return;
    }

    try {
      const parsedPreferences = JSON.parse(storedPreferences) as PropertyPreferences;
      setPreferences(parsedPreferences);
      
      // Initialize Gemini API with API key from environment variable
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        setError('Gemini API key not found. Please check your environment configuration.');
        setIsLoading(false);
        return;
      }
      
      initializeGemini(apiKey);
      
      // Generate property recommendations
      generatePropertyRecommendations(parsedPreferences)
        .then(response => {
          setResults(response);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error generating recommendations:', err);
          setError('An error occurred while generating recommendations. Please try again.');
          setIsLoading(false);
        });
    } catch (err) {
      console.error('Error parsing preferences:', err);
      setError('An error occurred while processing your preferences. Please try again.');
      setIsLoading(false);
    }
  }, []);

  // Handle going back to the form
  const handleBack = () => {
    router.push('/ai-agent');
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Finding Your Dream Home</h1>
        <p className="mb-8 text-lg">Our AI is analyzing your preferences and searching for the perfect match...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error</h1>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-yellow-700 mb-4">No Results</h1>
          <p className="text-yellow-700 mb-4">No property recommendations were found. Please try with different preferences.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Your Dream Home Matches</h1>
      <p className="mb-8 text-gray-600">
        Based on your preferences, our AI has found {results.recommendations.length} properties that match your criteria.
      </p>

      {/* Search Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Search Summary</h2>
        <p className="text-gray-700">{results.searchSummary}</p>
      </div>

      {/* Property Recommendations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Recommended Properties</h2>
        <div className="space-y-6">
          {results.recommendations.map((property: PropertyRecommendation) => (
            <div 
              key={property.id} 
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <div className="md:flex">
                <div className="md:w-1/3 bg-gray-200 md:h-auto h-48 relative">
                  {property.imageUrl ? (
                    <img 
                      src={property.imageUrl} 
                      alt={property.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 m-2 rounded">
                    {property.matchScore}% Match
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{property.title}</h3>
                    <p className="text-gray-600">{property.address}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div>
                      <span className="font-bold text-2xl">{formatPrice(property.price)}</span>
                    </div>
                    <div className="flex space-x-4">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.squareFeet.toLocaleString()} sq ft</span>
                      <span>Built {property.yearBuilt}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature, index) => (
                        <span 
                          key={index} 
                          className="bg-gray-100 px-2 py-1 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Why This Matches Your Preferences</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {property.reasonsForMatch.map((reason, index) => (
                        <li key={index} className="text-gray-700">{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      Contact Agent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <ul className="list-disc list-inside space-y-2">
          {results.nextSteps.map((step, index) => (
            <li key={index} className="text-gray-700">{step}</li>
          ))}
        </ul>
      </div>

      {/* Additional Questions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Refine Your Search</h2>
        <p className="mb-4">
          To help us find even better matches, consider answering these additional questions:
        </p>
        <div className="space-y-4">
          {results.additionalQuestions.map((question, index) => (
            <div 
              key={index} 
              className="border rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition"
            >
              <p className="font-medium">{question}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 mb-16 flex space-x-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Edit Preferences
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save These Results
        </button>
      </div>
    </div>
  );
} 