import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
let genAI: GoogleGenerativeAI;

// Initialize the model with your API key
export function initializeGemini(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
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

  // Get the generative model
  const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
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

  // Construct the prompt with language-specific instructions
  const prompt = promptTemplate.instructions
    .replace('{location}', preferences.location)
    .replace('{minBudget}', preferences.budget.min.toLocaleString())
    .replace('{maxBudget}', preferences.budget.max.toLocaleString())
    .replace('{bedrooms}', preferences.bedrooms.toString())
    .replace('{bathrooms}', preferences.bathrooms.toString())
    .replace('{propertyType}', preferences.propertyType)
    .replace('{mustHaveFeatures}', preferences.mustHaveFeatures.join(', '))
    .replace('{preferredFeatures}', preferences.preferredFeatures.join(', '))
    .replace('{timeframe}', preferences.timeframe)
    .replace('{additionalInfo}', preferences.additionalInfo)
    .replace('{jsonStructure}', promptTemplate.jsonGuide);

  try {
    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract the JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract valid JSON from the response');
    }
    
    const jsonStr = jsonMatch[0];
    const agentResponse = JSON.parse(jsonStr) as AIAgentResponse;
    
    return agentResponse;
  } catch (error) {
    console.error('Error generating property recommendations:', error);
    throw error;
  }
} 