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
   * Detect user intent using AI
   * @param {string} message - User's message
   * @param {string} language - User's language ('en' or 'vi')
   * @returns {Promise<string>} Intent type
   */
  async detectIntent(message, language = 'en') {
    const intentPrompt = language === 'vi'
      ? `Phân loại ý định của user. Trả về CHỈ MỘT TỪ:

CÁC INTENT HỢP LỆ:
- "trip_search" - Tìm/đặt chuyến xe, hỏi về tuyến đường (VD: "đi từ X đến Y", "tìm xe", "từ mê linh đến chợ cũ", "from A to B")
- "booking_status" - Kiểm tra đặt vé (VD: "mã đặt vé", "booking #123", "kiểm tra vé")
- "refund" - Hoàn tiền/hủy vé (VD: "hoàn tiền", "refund", "hủy vé")
- "support" - Liên hệ hỗ trợ (VD: "hotline", "liên hệ", "contact")
- "routes" - Hỏi tuyến đường có sẵn (VD: "các tuyến", "đi đâu được", "tuyến phổ biến")
- "popular" - Hỏi nhà xe tốt (VD: "nhà xe nào tốt", "xe đánh giá cao")
- "general" - Câu hỏi chung/chào hỏi

Câu user: "${message}"

TRẢ VỀ CHÍNH XÁC 1 TRONG CÁC TỪ TRÊN (không thêm gì khác):`
      : `Classify user intent. Return ONLY ONE WORD:

VALID INTENTS:
- "trip_search" - Search/book trips, ask about routes (e.g., "from X to Y", "find bus", "search trip")
- "booking_status" - Check booking (e.g., "booking #123", "check my booking")
- "refund" - Refund/cancel (e.g., "refund", "cancel ticket")
- "support" - Contact support (e.g., "hotline", "contact", "help")
- "routes" - Ask available routes (e.g., "what routes", "where can I go")
- "popular" - Ask top operators (e.g., "best bus", "top rated")
- "general" - General questions/greetings

User message: "${message}"

RETURN EXACTLY ONE OF THE WORDS ABOVE (nothing else):`;

    try {
      const response = await this.generateResponse(intentPrompt, {
        systemPrompt: 'You are an intent classification AI. Return ONLY the intent word, no explanations.'
      });

      const intent = response.trim().toLowerCase();
      
      // Validate intent
      const validIntents = ['trip_search', 'booking_status', 'refund', 'support', 'routes', 'popular', 'general'];
      if (validIntents.includes(intent)) {
        console.log(`🎯 AI detected intent: ${intent}`);
        return intent;
      }

      // Fallback to general if invalid
      console.log(`⚠️ AI returned invalid intent "${intent}", defaulting to general`);
      return 'general';
    } catch (error) {
      console.error('Intent detection failed:', error.message);
      throw error; // Let caller handle fallback
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
    const dayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString().split('T')[0];
    
    const extractionPrompt = language === 'vi'
      ? `CHỈ TRÍCH XUẤT thông tin từ câu sau. KHÔNG TẠO CÂU TRẢ LỜI. Trả về JSON thuần:

QUY TẮC NGÀY GIỜ (ƯU TIÊN CAO - PHẢI EXTRACT):
- "hôm nay" / "today" = "${today}"
- "ngày mai" / "tomorrow" = "${tomorrow}"
- "ngày mốt" / "ngày kia" / "mốt" / "kia" / "day after tomorrow" = "${dayAfterTomorrow}"
  VD: "vào ngày mốt" → date: "${dayAfterTomorrow}"
  VD: "đi chợ cũ ngày mốt" → date: "${dayAfterTomorrow}", destination: "chợ cũ"
  VD: "mốt đi đâu" → date: "${dayAfterTomorrow}"
- Ngày cụ thể: chuyển sang định dạng YYYY-MM-DD
  VD: "ngày 05/01" → "2026-01-05" (năm hiện tại hoặc năm sau nếu đã qua)
  VD: "5 tháng 1" → "2026-01-05"
  VD: "31/12" → "2025-12-31"
- QUAN TRỌNG: Chỉ cho phép ngày TỪ HÔM NAY TRỞ ĐI (${today} onwards)
  Nếu user hỏi ngày QUÁ KHỨ → trả về null và ghi chú trong response

QUY TẮC ĐỊA ĐIỂM:
- QUAN TRỌNG: Nếu user gõ KHÔNG DẤU (me linh, cho cu), tự động thêm dấu cho đúng tiếng Việt
  VD: "me linh" → "mê linh" (thêm dấu)
  VD: "cho cu" → "chợ cũ" (thêm dấu)
  VD: "cuc hai quan" → "cục hải quan" (thêm dấu)
- Giữ CHÍNH XÁC tên địa điểm như user gõ (nếu đã có dấu)
  VD: User gõ "Chợ Cũ" → "Chợ Cũ"
  VD: User gõ "BX 06" → "BX 06"
- MÃ TRẠM cũng là địa điểm hợp lệ: "BX 06", "Q1 020", "[BX 06]"
  VD: "đặt chuyến BX 06" → destination: "BX 06"
- Nếu chỉ 1 địa điểm, phân tích là origin hay destination

Câu: "${message}"

TRẢ VỀ JSON (không giải thích gì thêm):
{
  "origin": "tên chính xác như user gõ hoặc null",
  "destination": "tên chính xác như user gõ hoặc null", 
  "date": "YYYY-MM-DD hoặc null (null nếu quá khứ)",
  "time": "HH:MM hoặc null",
  "passengers": số người hoặc null,
  "busType": "loại xe hoặc null",
  "maxPrice": số tiền hoặc null
}`
      : `EXTRACT ONLY. DO NOT generate responses. Return pure JSON:

DATE RULES:
- "today" = "${today}"
- "tomorrow" = "${tomorrow}"
- "day after tomorrow" / "overmorrow" = "${dayAfterTomorrow}"
- Specific dates: convert to YYYY-MM-DD
  Ex: "January 5" → "2026-01-05" (current or next year if passed)
  Ex: "05/01" → "2026-01-05"
  Ex: "12/31" → "2025-12-31"
- IMPORTANT: Only allow dates FROM TODAY ONWARDS (${today} onwards)
  If user asks for PAST date → return null and note in response

LOCATION RULES:
- IMPORTANT: If user types WITHOUT diacritics, automatically add proper Vietnamese diacritics
  Ex: "me linh" → "mê linh" (add accents)
  Ex: "cho cu" → "chợ cũ" (add accents)
  Ex: "cuc hai quan" → "cục hải quan" (add accents)
- Keep location names as typed (if already has accents)
  Ex: User types "Chợ Cũ" → "Chợ Cũ"
- STOP CODES are valid locations: "BX 06", "Q1 020", "[BX 06]"
  Ex: "book BX 06" → destination: "BX 06"
- If only 1 location, analyze if origin or destination

Message: "${message}"

RETURN JSON (no explanation):
{
  "origin": "name with proper accents or null",
  "destination": "name with proper accents or null",
  "date": "YYYY-MM-DD or null (null if past date)",
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
