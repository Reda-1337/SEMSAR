import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
let genAI: GoogleGenerativeAI;

// Initialize the model with your API key
export function initializeGemini(apiKey: string) {
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Invalid Gemini API key. Please provide a valid API key.');
  }
  
  try {
    console.log('Initializing Gemini AI with provided API key');
    genAI = new GoogleGenerativeAI(apiKey);
    
    // Store the API key for validation checks
    Object.defineProperty(genAI, 'apiKey', {
      value: apiKey,
      writable: false,
      configurable: false
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw new Error(`Failed to initialize Gemini AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Property preference types
export type PropertyPreferences = {
  location: string;
  budget: {
    min: number;
    max: number;
  };
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  mustHaveFeatures: string[];
  preferredFeatures: string[];
  timeframe: string;
  additionalInfo: string;
  language: 'en' | 'ar' | 'fr'; // Add language preference
};

// Property recommendation types
export type PropertyRecommendation = {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: string;
  yearBuilt: number;
  features: string[];
  matchScore: number;
  reasonsForMatch: string[];
  imageUrl?: string;
};

export type AIAgentResponse = {
  recommendations: PropertyRecommendation[];
  searchSummary: string;
  nextSteps: string[];
  additionalQuestions: string[];
};

// Language-specific prompts
const languagePrompts = {
  en: {
    instructions: `
      As a real estate AI assistant, provide property recommendations based on the following preferences:
      
      Location: {location}
      Budget: ${'{minBudget}'} - ${'{maxBudget}'}
      Bedrooms: {bedrooms}
      Bathrooms: {bathrooms}
      Property Type: {propertyType}
      Must-Have Features: {mustHaveFeatures}
      Preferred Features: {preferredFeatures}
      Timeframe: {timeframe}
      Additional Information: {additionalInfo}
      
      Please provide output in the following JSON structure with only the JSON output and nothing else:
      {jsonStructure}
      
      Provide 3-5 property recommendations with realistic details. Each property should have 3-5 reasons why it's a good match.
      Include a search summary explaining your approach, 2-3 next steps the user could take, and 2-3 additional questions to refine the search.
    `,
    jsonGuide: `{
      "recommendations": [
        {
          "id": "string",
          "title": "string",
          "address": "string",
          "price": number,
          "bedrooms": number,
          "bathrooms": number,
          "squareFeet": number,
          "propertyType": "string",
          "yearBuilt": number,
          "features": ["string"],
          "matchScore": number (1-100),
          "reasonsForMatch": ["string"],
          "imageUrl": "string"
        }
      ],
      "searchSummary": "string",
      "nextSteps": ["string"],
      "additionalQuestions": ["string"]
    }`
  },
  ar: {
    instructions: `
      كمساعد ذكاء اصطناعي متخصص في العقارات، قدم توصيات العقارات بناءً على التفضيلات التالية:
      
      الموقع: {location}
      الميزانية: ${'{minBudget}'} - ${'{maxBudget}'}
      غرف النوم: {bedrooms}
      الحمامات: {bathrooms}
      نوع العقار: {propertyType}
      الميزات الضرورية: {mustHaveFeatures}
      الميزات المفضلة: {preferredFeatures}
      الإطار الزمني: {timeframe}
      معلومات إضافية: {additionalInfo}
      
      يرجى تقديم المخرجات في هيكل JSON التالي مع إخراج JSON فقط وليس أي شيء آخر:
      {jsonStructure}
      
      قدم 3-5 توصيات عقارية بتفاصيل واقعية. يجب أن يكون لكل عقار 3-5 أسباب توضح سبب كونه مناسبًا.
      قم بتضمين ملخص للبحث يشرح نهجك، و2-3 خطوات تالية يمكن للمستخدم اتخاذها، و2-3 أسئلة إضافية لتحسين البحث.
    `,
    jsonGuide: `{
      "recommendations": [
        {
          "id": "string",
          "title": "string",
          "address": "string",
          "price": number,
          "bedrooms": number,
          "bathrooms": number,
          "squareFeet": number,
          "propertyType": "string",
          "yearBuilt": number,
          "features": ["string"],
          "matchScore": number (1-100),
          "reasonsForMatch": ["string"],
          "imageUrl": "string"
        }
      ],
      "searchSummary": "string",
      "nextSteps": ["string"],
      "additionalQuestions": ["string"]
    }`
  },
  fr: {
    instructions: `
      En tant qu'assistant immobilier IA, fournissez des recommandations de propriétés basées sur les préférences suivantes:
      
      Emplacement: {location}
      Budget: ${'{minBudget}'} - ${'{maxBudget}'}
      Chambres: {bedrooms}
      Salles de bain: {bathrooms}
      Type de propriété: {propertyType}
      Caractéristiques essentielles: {mustHaveFeatures}
      Caractéristiques préférées: {preferredFeatures}
      Délai: {timeframe}
      Informations supplémentaires: {additionalInfo}
      
      Veuillez fournir la sortie dans la structure JSON suivante avec uniquement la sortie JSON et rien d'autre:
      {jsonStructure}
      
      Fournissez 3 à 5 recommandations de propriétés avec des détails réalistes. Chaque propriété doit avoir 3 à 5 raisons pour lesquelles elle correspond bien.
      Incluez un résumé de recherche expliquant votre approche, 2-3 prochaines étapes que l'utilisateur pourrait prendre, et 2-3 questions supplémentaires pour affiner la recherche.
    `,
    jsonGuide: `{
      "recommendations": [
        {
          "id": "string",
          "title": "string",
          "address": "string",
          "price": number,
          "bedrooms": number,
          "bathrooms": number,
          "squareFeet": number,
          "propertyType": "string",
          "yearBuilt": number,
          "features": ["string"],
          "matchScore": number (1-100),
          "reasonsForMatch": ["string"],
          "imageUrl": "string"
        }
      ],
      "searchSummary": "string",
      "nextSteps": ["string"],
      "additionalQuestions": ["string"]
    }`
  }
};

// Generate property recommendations based on user preferences
export async function generatePropertyRecommendations(
  preferences: PropertyPreferences
): Promise<AIAgentResponse> {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Call initializeGemini first.');
  }

  // Validate the API key format (basic check)
  if (!genAI.apiKey || genAI.apiKey.trim() === '') {
    throw new Error('Invalid or empty API key provided');
  }

  // Fix: Make location optional by providing a default value if it's missing
  const enhancedPreferences = {
    ...preferences,
    location: preferences.location || 'Any location'
  };

  // Log the model creation attempt
  console.log('Creating Gemini model with safety settings');

  // Get the generative model
  try {
    // Use gemini-2.0-flash model as requested by the user
    const modelName = 'gemini-2.0-flash';
    console.log(`Creating Gemini model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Get language-specific prompt (default to English if not specified)
    const language = preferences.language || 'en';
    const promptTemplate = languagePrompts[language] || languagePrompts.en;

    // Log the prompt construction
    console.log(`Constructing prompt in ${language} language`);

    // Construct the prompt with language-specific instructions
    const prompt = promptTemplate.instructions
      .replace('{location}', enhancedPreferences.location)
      .replace('{minBudget}', enhancedPreferences.budget.min.toLocaleString())
      .replace('{maxBudget}', enhancedPreferences.budget.max.toLocaleString())
      .replace('{bedrooms}', enhancedPreferences.bedrooms.toString())
      .replace('{bathrooms}', enhancedPreferences.bathrooms.toString())
      .replace('{propertyType}', enhancedPreferences.propertyType)
      .replace('{mustHaveFeatures}', enhancedPreferences.mustHaveFeatures.join(', '))
      .replace('{preferredFeatures}', enhancedPreferences.preferredFeatures.join(', '))
      .replace('{timeframe}', enhancedPreferences.timeframe)
      .replace('{additionalInfo}', enhancedPreferences.additionalInfo)
      .replace('{jsonStructure}', promptTemplate.jsonGuide);

    try {
      // Generate content with improved fetch error handling
      console.log(`Sending request to Gemini API using ${modelName} model...`);
      
      // Wrap the API call in a retry mechanism for better resilience
      let result;
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        try {
          result = await model.generateContent(prompt);
          break; // If successful, exit the retry loop
        } catch (fetchError) {
          retries++;
          console.error(`API fetch attempt ${retries} failed:`, fetchError);
          
          if (retries > maxRetries) {
            throw new Error(`Failed to connect to Gemini API after ${maxRetries} attempts. Please check your internet connection and API key.`);
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (!result || !result.response) {
        throw new Error('Empty response from Gemini API');
      }
      
      console.log(`Received response from Gemini API (${modelName})`);
      const response = result.response;
      const text = response.text();
      
      if (!text || text.trim() === '') {
        throw new Error('Empty text in Gemini response');
      }
      
      // Extract the JSON from the text
      console.log('Extracting JSON from response');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to extract JSON. Response text:', text.substring(0, 200) + '...');
        
        // More helpful error message with the full response text for debugging
        throw new Error(`Failed to extract valid JSON from the response. Raw response: "${text.substring(0, 300)}..."`);
      }
      
      const jsonStr = jsonMatch[0];
      console.log('Parsing JSON response');
      try {
        const agentResponse = JSON.parse(jsonStr) as AIAgentResponse;
        
        // Validate the response structure
        if (!agentResponse.recommendations || !Array.isArray(agentResponse.recommendations)) {
          throw new Error('Invalid response structure: recommendations array is missing');
        }
        
        return agentResponse;
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('JSON string that failed to parse:', jsonStr.substring(0, 200) + '...');
        throw new Error('Failed to parse JSON response from Gemini API');
      }
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      throw apiError;
    }
  } catch (modelError) {
    console.error('Error creating Gemini model:', modelError);
    throw modelError;
  }
} 