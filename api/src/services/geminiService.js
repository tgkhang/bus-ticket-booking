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
   * @param {string} language - User's language ('en' or 'vi')
   * @returns {string}
   */
  getDefaultSystemPrompt(language = 'en') {
    if (language === 'vi') {
      return `Bạn là trợ lý AI thông minh cho hệ thống đặt vé xe.

NGUYÊN TẮC QUAN TRỌNG:
❌ KHÔNG hỏi lặp lại những thông tin đã biết
❌ KHÔNG hỏi "Bạn muốn đi từ đâu?" khi đã biết điểm đến
✅ Hiển thị kết quả NGAY khi có bất kỳ thông tin nào
✅ Dùng giá trị mặc định thông minh (hôm nay, 1 người)
✅ Gợi ý bổ sung sau khi hiện kết quả

PHONG CÁCH:
- Ngắn gọn, đi thẳng vào vấn đề
- Hiện kết quả trước, hỏi sau (nếu cần)
- Thân thiện nhưng hiệu quả

VÍ DỤ TỐT:
User: "tôi muốn đi Chợ Cũ"
Bot: "[Hiển thị 10 chuyến đến Chợ Cũ hôm nay]. Bạn muốn chọn điểm xuất phát cụ thể không?"`;
    }
    
    return `You are an intelligent AI assistant for a bus booking system.

IMPORTANT PRINCIPLES:
❌ DON'T repeat questions about known information
❌ DON'T ask "Where from?" when destination is known
✅ Show results IMMEDIATELY with any available info
✅ Use smart defaults (today, 1 passenger)
✅ Suggest refinements after showing results

STYLE:
- Concise and direct
- Results first, questions later (if needed)
- Friendly but efficient

GOOD EXAMPLE:
User: "I want to go to Central Market"
Bot: "[Show 10 trips to Central Market today]. Want to specify origin?"`;
  }

  /**
   * Extract trip search intent and parameters from user message
   * @param {string} message - User's message
   * @param {string} language - User's language ('en' or 'vi')
   * @returns {Promise<Object>} Extracted parameters
   */
  async extractTripSearchIntent(message, language = 'en') {
    // Calculate dates dynamically for each request
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString().split('T')[0];
    
    const extractionPrompt = language === 'vi'
      ? `CHỈ TRÍCH XUẤT thông tin từ câu sau. KHÔNG TẠO CÂU TRẢ LỜI. Trả về JSON thuần:

QUY TẮC:
- "ngày mai" = "${tomorrow}"
- "hôm nay" = "${today}"
- Giữ CHÍNH XÁC tên địa điểm như user gõ, KHÔNG đổi hoa/thường
  VD: User gõ "cục hải quan thành phố" → "cục hải quan thành phố" (KHÔNG viết "Cục Hải Quan Thành Phố")
  VD: User gõ "Chợ Cũ" → "Chợ Cũ"
- MÃ TRẠM cũng là địa điểm hợp lệ: "BX 06", "Q1 020", "[BX 06]"
  VD: "đặt chuyến BX 06" → destination: "BX 06"
  VD: "đi BX 06" → destination: "BX 06"
- Nếu chỉ 1 địa điểm, phân tích là origin hay destination

Câu: "${message}"

TRẢ VỀ JSON (không giải thích gì thêm):
{
  "origin": "tên chính xác như user gõ hoặc null",
  "destination": "tên chính xác như user gõ hoặc null", 
  "date": "YYYY-MM-DD hoặc null",
  "time": "HH:MM hoặc null",
  "passengers": số người hoặc null,
  "busType": "loại xe hoặc null",
  "maxPrice": số tiền hoặc null
}`
      : `EXTRACT ONLY. DO NOT generate responses. Return pure JSON:

RULES:
- "tomorrow" = "${tomorrow}"
- "today" = "${today}"
- Keep location names EXACTLY as user typed, DO NOT change capitalization
  Ex: User types "central market" → "central market" (NOT "Central Market")
  Ex: User types "Airport" → "Airport"
- STOP CODES are valid locations: "BX 06", "Q1 020", "[BX 06]"
  Ex: "book BX 06" → destination: "BX 06"
  Ex: "go to BX 06" → destination: "BX 06"
- If only 1 location, analyze if origin or destination

Message: "${message}"

RETURN JSON (no explanation):
{
  "origin": "exact name as user typed or null",
  "destination": "exact name as user typed or null",
  "date": "YYYY-MM-DD or null",
  "time": "HH:MM or null",
  "passengers": number or null,
  "busType": "string or null",
  "maxPrice": number or null
}`;

    try {
      const response = await this.generateResponse(extractionPrompt, {
        systemPrompt: 'You are a JSON extraction machine. Your ONLY job is to return pure JSON. NEVER generate conversational responses. NEVER create fake data. NEVER add explanations. Return ONLY the JSON object with extracted parameters or empty values.'
      });
      
      console.log('Raw AI extraction response:', response.substring(0, 300));
      
      // Clean response and parse JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // DON'T set default date - let chatService handle smart future search
        // Only set passengers default
        if (!parsed.passengers || parsed.passengers < 1) {
          parsed.passengers = 1; // Default to 1 passenger
        }
        
        console.log('🔍 Extracted params:', parsed);
        return parsed;
      }
      
      return {};
    } catch (error) {
      console.error('Failed to extract trip search intent:', error);
      // Re-throw error to let chatService handle fallback
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
