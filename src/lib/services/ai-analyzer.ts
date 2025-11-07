import { GoogleGenAI } from '@google/genai';
import type { NewsArticle, Priority } from '../types';

// Initialize Gemini AI (API key should be in environment variables)
const API_KEY = process.env.GEMINI_API_KEY || '';

let genAI: GoogleGenAI | null = null;

function initializeAI(): GoogleGenAI {
  if (!genAI) {
    if (!API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      // Return a mock instance for development
      throw new Error('GEMINI_API_KEY is required');
    }
    genAI = new GoogleGenAI({ apiKey: API_KEY });
  }
  return genAI;
}

export async function analyzeNewsPriority(
  cityName: string,
  articles: NewsArticle[]
): Promise<{ priority: Priority; analysis?: string }> {
  // If no articles, return lowest priority
  if (!articles || articles.length === 0) {
    return { priority: 3 };
  }

  try {
    const ai = initializeAI();

    // Prepare the prompt with article titles
    const articleTitles = articles
      .slice(0, 10) // Limit to first 10 articles to avoid token limits
      .map((article, index) => `${index + 1}. ${article.title}`)
      .join('\n');

    const prompt = `You are a news analyst. Analyze the following news headlines from ${cityName}, India and determine the overall priority/alertness level.

News Headlines:
${articleTitles}

Based on these headlines, assign a priority level:
- Priority 1 (HIGH): Critical/urgent news like disasters, major accidents, significant political events, public safety threats, major crimes
- Priority 2 (MEDIUM): Notable news like moderate political updates, business news, infrastructure developments, sports events
- Priority 3 (LOW): Routine news like entertainment, minor local events, general updates

Respond in the following JSON format only:
{
  "priority": <1, 2, or 3>,
  "reasoning": "<brief explanation in one sentence>"
}`;

    // Use the correct API for @google/genai
    const result = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: [{
            role: 'user',
            parts: [{ text: prompt }],
      }],
    });

    const text = result.text || '';

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const priority = parsed.priority as Priority;
      
      // Validate priority is 1, 2, or 3
      if ([1, 2, 3].includes(priority)) {
        return {
          priority,
          analysis: parsed.reasoning,
        };
      }
    }

    // If parsing failed, use fallback logic
    console.warn(`Failed to parse AI response for ${cityName}, using fallback`);
    return fallbackPriorityAnalysis(articles);
  } catch (error) {
    console.error(`Error analyzing news for ${cityName}:`, error);
    // Fallback to keyword-based analysis
    return fallbackPriorityAnalysis(articles);
  }
}

function fallbackPriorityAnalysis(
  articles: NewsArticle[]
): { priority: Priority; analysis?: string } {
  const allText = articles
    .map((a) => `${a.title} ${a.description || ''}`)
    .join(' ')
    .toLowerCase();

  // High priority keywords
  const highPriorityKeywords = [
    'accident',
    'disaster',
    'fire',
    'flood',
    'earthquake',
    'cyclone',
    'terror',
    'attack',
    'death',
    'murder',
    'crisis',
    'emergency',
    'explosion',
    'collapse',
    'riot',
  ];

  // Medium priority keywords
  const mediumPriorityKeywords = [
    'election',
    'government',
    'minister',
    'policy',
    'protest',
    'strike',
    'development',
    'project',
    'economy',
    'business',
    'market',
  ];

  // Check for high priority keywords
  if (highPriorityKeywords.some((keyword) => allText.includes(keyword))) {
    return {
      priority: 1,
      analysis: 'Contains critical news indicators (fallback analysis)',
    };
  }

  // Check for medium priority keywords
  if (mediumPriorityKeywords.some((keyword) => allText.includes(keyword))) {
    return {
      priority: 2,
      analysis: 'Contains notable news topics (fallback analysis)',
    };
  }

  // Default to low priority
  return {
    priority: 3,
    analysis: 'Routine news content (fallback analysis)',
  };
}

export async function batchAnalyzeNews(
  cityNewsMap: Map<string, NewsArticle[]>
): Promise<Map<string, { priority: Priority; analysis?: string }>> {
  const results = new Map<string, { priority: Priority; analysis?: string }>();
  const entries = Array.from(cityNewsMap.entries());
  
  // Batch size: analyze 5 cities per API request to reduce API calls
  const BATCH_SIZE = 5;
  const batches: Array<[string, NewsArticle[]][]> = [];
  
  // Split cities into batches
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    batches.push(entries.slice(i, i + BATCH_SIZE));
  }

  console.log(`Processing ${entries.length} cities in ${batches.length} batches (${BATCH_SIZE} cities per batch)`);

  // Process each batch with rate limiting
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    try {
      // Analyze multiple cities in a single API request
      const batchResults = await analyzeCitiesBatch(batch);
      
      // Store results
      batchResults.forEach((result, cityName) => {
        results.set(cityName, result);
      });
      
      console.log(`✓ Batch ${batchIndex + 1}/${batches.length} completed (${batch.length} cities)`);
      
      // Rate limiting: Wait 5 seconds between batches (12 requests per minute max)
      if (batchIndex < batches.length - 1) {
        console.log(`Waiting 5 seconds before next batch to respect rate limits...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`Failed to analyze batch ${batchIndex + 1}:`, error);
      
      // Fallback: use keyword analysis for failed batch
      batch.forEach(([cityName, articles]) => {
        results.set(cityName, fallbackPriorityAnalysis(articles));
      });
    }
  }

  return results;
}

async function analyzeCitiesBatch(
  citiesBatch: Array<[string, NewsArticle[]]>
): Promise<Map<string, { priority: Priority; analysis?: string }>> {
  const results = new Map<string, { priority: Priority; analysis?: string }>();

  try {
    const ai = initializeAI();

    // Build a combined prompt for all cities in the batch
    let combinedPrompt = `You are a news analyst. Analyze the following news headlines from multiple cities in India and determine the priority/alertness level for each city.

For each city, assign a priority level:
- Priority 1 (HIGH): Critical/urgent news like disasters, major accidents, significant political events, public safety threats, major crimes
- Priority 2 (MEDIUM): Notable news like moderate political updates, business news, infrastructure developments, sports events
- Priority 3 (LOW): Routine news like entertainment, minor local events, general updates

`;

    // Add each city's headlines to the prompt
    citiesBatch.forEach(([cityName, articles], index) => {
      const headlines = articles
        .slice(0, 5) // Limit to 5 headlines per city to keep prompt manageable
        .map((article, i) => `  ${i + 1}. ${article.title}`)
        .join('\n');
      
      combinedPrompt += `
CITY ${index + 1}: ${cityName}
Headlines:
${headlines}

`;
    });

    combinedPrompt += `
Respond with a JSON array containing an object for each city with this exact format:
[
  {
    "city": "CityName",
    "priority": <1, 2, or 3>,
    "reasoning": "<brief explanation in one sentence>"
  }
]

Ensure you provide analysis for all ${citiesBatch.length} cities listed above.`;

    // Make single API request for all cities
    const result = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [{
        role: 'user',
        parts: [{ text: combinedPrompt }],
      }],
    });

    const text = result.text || '';

    // Parse the JSON array response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (Array.isArray(parsed)) {
        // Map results back to cities
        parsed.forEach((item: any) => {
          const cityName = item.city;
          const priority = item.priority as Priority;
          
          // Validate priority and find matching city
          if ([1, 2, 3].includes(priority) && cityName) {
            // Find the matching city (case-insensitive)
            const matchingCity = citiesBatch.find(
              ([name]) => name.toLowerCase() === cityName.toLowerCase()
            );
            
            if (matchingCity) {
              results.set(matchingCity[0], {
                priority,
                analysis: item.reasoning,
              });
            }
          }
        });
      }
    }

    // For any cities not in results, use fallback
    citiesBatch.forEach(([cityName, articles]) => {
      if (!results.has(cityName)) {
        console.warn(`No AI result for ${cityName}, using fallback`);
        results.set(cityName, fallbackPriorityAnalysis(articles));
      }
    });

  } catch (error) {
    console.error('Error in batch analysis:', error);
    
    // Fallback: analyze each city individually with keyword analysis
    citiesBatch.forEach(([cityName, articles]) => {
      results.set(cityName, fallbackPriorityAnalysis(articles));
    });
  }

  return results;
}
