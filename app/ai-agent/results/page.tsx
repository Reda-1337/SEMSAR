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
      
      // Debug logging
      console.log('Using API Key:', apiKey ? 'API key is present (hidden for security)' : 'No API key found');
      console.log('User preferences:', {
        ...parsedPreferences,
        // Don't log all details for privacy
        hasLocation: !!parsedPreferences.location,
        hasBudget: !!parsedPreferences.budget,
        preferredLanguage: parsedPreferences.language
      });
      
      try {
        initializeGemini(apiKey);
        console.log('Gemini API initialized successfully');
        
        // Generate property recommendations
        generatePropertyRecommendations(parsedPreferences)
          .then(response => {
            console.log('Received recommendations successfully');
            setResults(response);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Error generating recommendations:', err);
            // Extract more detailed error information
            const errorMessage = err instanceof Error 
              ? `${err.name}: ${err.message}` 
              : 'Unknown error occurred';
            setError(`An error occurred while generating recommendations: ${errorMessage}. Please try again.`);
            setIsLoading(false);
          });
      } catch (initError) {
        console.error('Error initializing Gemini API:', initError);
        const errorMessage = initError instanceof Error 
          ? `${initError.name}: ${initError.message}` 
          : 'Unknown initialization error';
        setError(`Failed to initialize AI service: ${errorMessage}`);
        setIsLoading(false);
      }
    } catch (parseError) {
      console.error('Error parsing preferences:', parseError);
      const errorMessage = parseError instanceof Error 
        ? `${parseError.name}: ${parseError.message}` 
        : 'Unknown parsing error';
      setError(`An error occurred while processing your preferences: ${errorMessage}. Please try again.`);
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

  // Language-specific UI text
  const uiText = {
    en: {
      loading: "Finding Your Dream Home",
      loadingSubtext: "Our AI is analyzing your preferences and searching for the perfect match...",
      error: "Error",
      noPreferences: "No preferences found. Please go back and fill out the form.",
      goBack: "Go Back",
      noResults: "No Results",
      tryAgain: "No property recommendations were found. Please try with different preferences.",
      dreamHomeMatches: "Your Dream Home Matches",
      matchesFound: "Based on your preferences, our AI has found {count} properties that match your criteria.",
      searchSummary: "Search Summary",
      recommendedProperties: "Recommended Properties",
      features: "Features",
      whyMatchesPreferences: "Why This Matches Your Preferences",
      contactAgent: "Contact Agent",
      nextSteps: "Next Steps",
      refineSearch: "Refine Your Search",
      refineSearchSubtext: "To help us find even better matches, consider answering these additional questions:",
      editPreferences: "Edit Preferences",
      saveResults: "Save These Results"
    },
    ar: {
      loading: "البحث عن منزل أحلامك",
      loadingSubtext: "الذكاء الاصطناعي لدينا يحلل تفضيلاتك ويبحث عن التطابق المثالي...",
      error: "خطأ",
      noPreferences: "لم يتم العثور على تفضيلات. يرجى العودة وملء النموذج.",
      goBack: "عودة",
      noResults: "لا توجد نتائج",
      tryAgain: "لم يتم العثور على توصيات العقارات. يرجى المحاولة بتفضيلات مختلفة.",
      dreamHomeMatches: "تطابقات منزل أحلامك",
      matchesFound: "بناءً على تفضيلاتك، وجد الذكاء الاصطناعي لدينا {count} عقارات تطابق معاييرك.",
      searchSummary: "ملخص البحث",
      recommendedProperties: "العقارات الموصى بها",
      features: "الميزات",
      whyMatchesPreferences: "لماذا يتطابق هذا مع تفضيلاتك",
      contactAgent: "اتصل بالوكيل",
      nextSteps: "الخطوات التالية",
      refineSearch: "تحسين البحث",
      refineSearchSubtext: "لمساعدتنا في العثور على تطابقات أفضل، يرجى الإجابة على هذه الأسئلة الإضافية:",
      editPreferences: "تعديل التفضيلات",
      saveResults: "حفظ هذه النتائج"
    },
    fr: {
      loading: "Recherche de Votre Maison de Rêve",
      loadingSubtext: "Notre IA analyse vos préférences et recherche la correspondance parfaite...",
      error: "Erreur",
      noPreferences: "Aucune préférence trouvée. Veuillez revenir en arrière et remplir le formulaire.",
      goBack: "Retour",
      noResults: "Aucun Résultat",
      tryAgain: "Aucune recommandation de propriété n'a été trouvée. Veuillez essayer avec des préférences différentes.",
      dreamHomeMatches: "Correspondances de Votre Maison de Rêve",
      matchesFound: "Sur la base de vos préférences, notre IA a trouvé {count} propriétés qui correspondent à vos critères.",
      searchSummary: "Résumé de la Recherche",
      recommendedProperties: "Propriétés Recommandées",
      features: "Caractéristiques",
      whyMatchesPreferences: "Pourquoi Cela Correspond à Vos Préférences",
      contactAgent: "Contacter l'Agent",
      nextSteps: "Prochaines Étapes",
      refineSearch: "Affiner Votre Recherche",
      refineSearchSubtext: "Pour nous aider à trouver de meilleures correspondances, veuillez répondre à ces questions supplémentaires :",
      editPreferences: "Modifier les Préférences",
      saveResults: "Enregistrer Ces Résultats"
    }
  };

  // Get the correct language text based on user preference
  const getText = (key: string) => {
    const language = preferences?.language || 'en';
    const texts = uiText[language as keyof typeof uiText] || uiText.en;
    return texts[key as keyof typeof texts] || uiText.en[key as keyof typeof uiText.en];
  };

  // Format for RTL languages (Arabic)
  const isRTL = preferences?.language === 'ar';
  const rtlClass = isRTL ? 'rtl' : '';

  if (isLoading) {
    return (
      <div className={`max-w-5xl mx-auto text-center py-16 ${rtlClass}`}>
        <h1 className="text-3xl font-bold mb-4">{getText('loading')}</h1>
        <p className="mb-8 text-lg">{getText('loadingSubtext')}</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`max-w-3xl mx-auto py-8 ${rtlClass}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-red-700 mb-4">{getText('error')}</h1>
          <p className="text-red-700 mb-4">{error}</p>
          
          {/* Fallback suggestion */}
          <div className="mt-6 mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Alternative Options</h2>
            <p className="mb-4">While we're fixing this issue, you can try:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Refreshing the page and trying again</li>
              <li>Using different preferences</li>
              <li>Checking back in a few minutes</li>
              <li>Browsing our regular property listings instead</li>
            </ul>
            <p className="text-sm text-gray-600">
              Note: This feature requires the Gemini API to be properly configured. 
              If you're the administrator, please verify your API key is correctly set up.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {getText('goBack')}
            </button>
            <a 
              href="/search"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
            >
              Browse Properties
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`max-w-3xl mx-auto py-8 ${rtlClass}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-yellow-700 mb-4">{getText('noResults')}</h1>
          <p className="text-yellow-700 mb-4">{getText('tryAgain')}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {getText('goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto ${rtlClass}`}>
      <h1 className="text-3xl font-bold mb-2">{getText('dreamHomeMatches')}</h1>
      <p className="mb-8 text-gray-600">
        {getText('matchesFound').replace('{count}', results.recommendations.length.toString())}
      </p>

      {/* Search Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">{getText('searchSummary')}</h2>
        <p className="text-gray-700">{results.searchSummary}</p>
      </div>

      {/* Property Recommendations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">{getText('recommendedProperties')}</h2>
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
                    <h4 className="font-semibold mb-2">{getText('features')}</h4>
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
                    <h4 className="font-semibold mb-2">{getText('whyMatchesPreferences')}</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {property.reasonsForMatch.map((reason, index) => (
                        <li key={index} className="text-gray-700">{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      {getText('contactAgent')}
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
        <h2 className="text-2xl font-semibold mb-4">{getText('nextSteps')}</h2>
        <ul className="list-disc list-inside space-y-2">
          {results.nextSteps.map((step, index) => (
            <li key={index} className="text-gray-700">{step}</li>
          ))}
        </ul>
      </div>

      {/* Additional Questions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{getText('refineSearch')}</h2>
        <p className="mb-4">
          {getText('refineSearchSubtext')}
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
          {getText('editPreferences')}
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {getText('saveResults')}
        </button>
      </div>
    </div>
  );
} 