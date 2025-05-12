# Real Estate Platform with AI Home Finder

A modern real estate platform with an AI-powered home finder feature that helps users discover their dream home based on their preferences.

## Features

- **AI Home Finder**: Utilizes Google's Gemini AI to recommend properties based on user preferences
- **Structured Output**: Gemini API generates structured property recommendations in a consistent format
- **Modern UI**: Built with Next.js and Tailwind CSS for a beautiful, responsive user experience
- **Multi-step Form**: Easy-to-use preference collection form with a step-by-step interface

## Getting Started

### Prerequisites

- Node.js 18.x or later
- A Google Gemini API key (get one at [Google AI Studio](https://makersuite.google.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/real-estate-platform.git
   cd real-estate-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create an environment variables file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Edit `.env.local` and add your Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How the AI Home Finder Works

The AI Home Finder feature uses Google's Gemini AI to generate personalized property recommendations:

1. Users complete a multi-step form specifying their preferences (location, budget, features, etc.)
2. The application sends these preferences to the Gemini API with a prompt that requests structured output
3. Gemini analyzes the preferences and generates realistic property recommendations
4. The results are displayed in an easy-to-browse format with match scores and explanations

### Output Structure

The Gemini API returns a structured JSON response with:

- Property recommendations (title, address, price, features, etc.)
- Match score and reasons for each recommendation
- Search summary explaining the approach
- Next steps for the user
- Additional questions to refine the search

## Customization

### Adding More Property Features

To add more property features to the checkboxes:

1. Open `app/ai-agent/page.tsx`
2. Find the `commonFeatures` array
3. Add your new features to the array

### Modifying the Prompt

To customize how the AI generates recommendations:

1. Open `app/utils/gemini.ts`
2. Find the `prompt` template in the `generatePropertyRecommendations` function
3. Modify the prompt to change the instructions or output format

## Deployment

The application can be deployed to Vercel:

```bash
npm run build
vercel deploy
```

Remember to set up the environment variable for your Gemini API key in your deployment environment.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 