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

  // Construct the prompt
  const prompt = `
    As a real estate AI assistant, provide property recommendations based on the following preferences:
    
    Location: ${preferences.location}
    Budget: $${preferences.budget.min.toLocaleString()} - $${preferences.budget.max.toLocaleString()}
    Bedrooms: ${preferences.bedrooms}
    Bathrooms: ${preferences.bathrooms}
    Property Type: ${preferences.propertyType}
    Must-Have Features: ${preferences.mustHaveFeatures.join(', ')}
    Preferred Features: ${preferences.preferredFeatures.join(', ')}
    Timeframe: ${preferences.timeframe}
    Additional Information: ${preferences.additionalInfo}
    
    Please provide output in the following JSON structure with only the JSON output and nothing else:
    {
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
    }
    
    Provide 3-5 property recommendations with realistic details. Each property should have 3-5 reasons why it's a good match.
    Include a search summary explaining your approach, 2-3 next steps the user could take, and 2-3 additional questions to refine the search.
  `;

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