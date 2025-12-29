import axios from 'axios';

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-2.5-flash';
  }

  /**
   * Generate AI response from Gemini
   * @param {string} userMessage - User's message
   * @param {Object} context - Optional context (previous messages, system prompt,...)
   * @returns {Promise<string>} AI response
   */
  async generateResponse(userMessage, context = {}) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
      const systemPrompt = context.systemPrompt || this.getDefaultSystemPrompt();
      const conversationHistory = context.history || [];

      // Build message array for Gemini
      const contents = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ];

      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await axios.post(url, {
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      }

      throw new Error('Invalid response from Gemini API');
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your GEMINI_API_KEY configuration.');
      }
      
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  /**
   * Get default system prompt for the chatbot
   * @returns {string}
   */
  getDefaultSystemPrompt() {
    return `You are a helpful AI assistant for a bus ticket booking system. Your role is to:
- Help users search for bus trips based on their requirements (origin, destination, date, time, etc.)
- Assist users with booking tickets (select seats, enter passenger info, confirm booking)
- Answer questions about booking status, refunds, routes, and general support
- Be friendly, concise, and helpful

When users ask about trips, extract key information like:
- Origin city/location
- Destination city/location  
- Travel date
- Preferred departure time
- Number of passengers
- Budget/price range
- Preferred bus type or amenities

When users want to book, guide them through:
1. Confirming trip selection
2. Selecting seats
3. Entering passenger details
4. Payment and confirmation

Keep responses clear and actionable. If you need more information, ask specific questions. IMPORTANT: Always respond in English unless the user writes in Vietnamese.`;
  }

  /**
   * Extract trip search intent and parameters from user message
   * @param {string} message - User's message
   * @param {string} language - User's language ('en' or 'vi')
   * @returns {Promise<Object>} Extracted parameters
   */
  async extractTripSearchIntent(message, language = 'en') {
    const extractionPrompt = `Extract trip search parameters from this message. Return ONLY a valid JSON object with these fields (use null if not mentioned):
{
  "origin": "city name or null",
  "destination": "city name or null",
  "date": "YYYY-MM-DD or null",
  "time": "HH:MM or null",
  "passengers": number or null,
  "busType": "string or null",
  "maxPrice": number or null
}

User message: "${message}"

Return only the JSON object, no explanation.`;

    try {
      const response = await this.generateResponse(extractionPrompt, {
        systemPrompt: 'You are a JSON extraction assistant. Return only valid JSON.'
      });
      
      // Clean response and parse JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {};
    } catch (error) {
      console.error('Failed to extract trip search intent:', error);
      return {};
    }
  }
}

export const geminiService = new GeminiService();
