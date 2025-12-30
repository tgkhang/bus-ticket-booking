import axios from 'axios';

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama-3.3-70b-versatile'; // Best model
    
    if (!this.apiKey) {
      console.warn('⚠️GROQ_API_KEY not set. AI features will not work.');
    }
  }

  /**
   * Generate response using Groq
   * @param {string} userMessage - User's message
   * @param {object} options - Additional options (systemPrompt, temperature, maxTokens)
   * @returns {Promise<string>} AI response
   */
  async generateResponse(userMessage, options = {}) {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }

    const {
      systemPrompt = 'You are a helpful AI assistant.',
      temperature = 0.1,
      maxTokens = 500
    } = options;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature,
          max_tokens: maxTokens,
          top_p: 1,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10s timeout
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Groq API');
      }

      return content.trim();
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Groq API quota exceeded. Please try again later.');
      }
      
      console.error('Groq API error:', error.response?.data || error.message);
      throw new Error('Failed to get AI response. Please try again.');
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
        systemPrompt: 'You are an intent classification AI. Return ONLY the intent word, no explanations.',
        temperature: 0.1,
        maxTokens: 10
      });

      const intent = response.toLowerCase().trim();
      
      // Validate intent
      const validIntents = ['trip_search', 'booking_status', 'refund', 'support', 'routes', 'popular', 'general'];
      if (validIntents.includes(intent)) {
        console.log(`🎯 Groq detected intent: ${intent}`);
        return intent;
      }

      // Fallback to general if invalid
      console.log(`⚠️ Groq returned invalid intent "${intent}", defaulting to general`);
      return 'general';
    } catch (error) {
      console.error('Intent detection failed:', error.message);
      throw error; // Propagate error to caller
    }
  }

  /**
   * Extract trip search intent and parameters from user message
   * @param {string} message - User's message
   * @param {string} language - User's language ('en' or 'vi')
   * @returns {Promise<Object>} Extracted parameters
   */
  async extractTripSearchIntent(message, language = 'en') {
    // Calculate dates dynamically for each request, using LOCAL timezone, not UTC
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;
    
    const dayAfterTomorrowDate = new Date(now);
    dayAfterTomorrowDate.setDate(dayAfterTomorrowDate.getDate() + 2);
    const dayAfterTomorrow = `${dayAfterTomorrowDate.getFullYear()}-${String(dayAfterTomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(dayAfterTomorrowDate.getDate()).padStart(2, '0')}`;
    
    const extractionPrompt = language === 'vi'
      ? `CHỈ TRÍCH XUẤT thông tin từ câu sau. KHÔNG TẠO CÂU TRẢ LỜI. Trả về JSON thuần:

QUY TẮC NGÀY GIỜ (ƯU TIÊN CAO):
- ⚠️ QUAN TRỌNG NHẤT: Nếu user KHÔNG NHẮC ĐẾN ngày → date: null
  VD: "tôi muốn đi công trường mê linh" → date: null (KHÔNG CÓ ngày trong câu)
  VD: "đi chợ cũ" → date: null (KHÔNG CÓ ngày trong câu)

- CHỈ EXTRACT ngày khi user THỰC SỰ NÓI VỀ NGÀY:
  * CÁC NGÀY CƠ BẢN:
    - "hôm nay" / "today" = "${today}"
    - "ngày mai" / "mai" / "tomorrow" = "${tomorrow}"
    - "ngày mốt" / "ngày kia" / "mốt" / "kia" = "${dayAfterTomorrow}"
  
  * BUỔI TRONG NGÀY (chỉ extract ngày, time = null vì user không nói giờ cụ thể):
    - "sáng nay" / "sáng hôm nay" → date: "${today}", time: null
    - "chiều nay" / "chiều hôm nay" → date: "${today}", time: null
    - "tối nay" / "tối hôm nay" → date: "${today}", time: null
    - "sáng mai" / "mai sáng" → date: "${tomorrow}", time: null
    - "chiều mai" / "mai chiều" → date: "${tomorrow}", time: null
    - "tối mai" / "mai tối" → date: "${tomorrow}", time: null
    - "sáng mốt" → date: "${dayAfterTomorrow}", time: null
  
  * THỨ TRONG TUẦN:
    - "thứ 2 này" / "thứ hai tuần này" → tính thứ 2 tuần này (nếu chưa qua) hoặc tuần sau (nếu đã qua)
    - "thứ 3 này", "thứ 4 này", "thứ 5 này", "thứ 6 này", "thứ 7 này", "chủ nhật này" → tương tự
    - "thứ 2 tuần sau", "thứ 3 tuần sau" → tính thứ đó của tuần sau
  
  * TUẦN / THÁNG:
    - "tuần sau" / "tuần tới" / "next week" → thứ 2 tuần sau
    - "cuối tuần này" / "this weekend" → thứ 7 tuần này
    - "cuối tuần sau" / "next weekend" → thứ 7 tuần sau
    - "tuần này" → thứ 2 tuần này (nếu chưa qua) hoặc ngày hôm nay
    - "tháng sau" / "next month" → ngày 1 tháng sau
  
  * GIỜ CỤ THỂ:
    - "6 giờ sáng" / "6AM" → time: "06:00"
    - "2 giờ chiều" / "2PM" → time: "14:00"
    - "8 giờ tối" / "8PM" → time: "20:00"
    - "lúc 15h30" → time: "15:30"
  
  * NGÀY CỤ THỂ:
    - "ngày 05/01" → "2026-01-05" (năm hiện tại hoặc năm sau nếu đã qua)
    - "5 tháng 1" / "5/1" → "2026-01-05"
    - "31/12" → "2025-12-31"
    - "30/12" → "2025-12-30" (LUÔN EXTRACT kể cả ngày quá khứ, chatService sẽ validate)
  
  * ⚠️ QUAN TRỌNG: LUÔN EXTRACT ngày nếu user nhắc, KỂ CẢ NGÀY QUÁ KHỨ
    Chatbot sẽ tự kiểm tra và cảnh báo user nếu ngày đã qua

QUY TẮC ĐỊA ĐIỂM:
- QUAN TRỌNG: Nếu user gõ KHÔNG DẤU, tự động thêm dấu cho đúng tiếng Việt
  VD: "me linh" → "mê linh" | "cho cu" → "chợ cũ" | "cuc hai quan" → "cục hải quan"
- Giữ CHÍNH XÁC tên địa điểm như user gõ (nếu đã có dấu)
- MÃ TRẠM hợp lệ: "BX 06", "Q1 020", "[BX 06]"
- Nếu chỉ 1 địa điểm, phân tích là origin hay destination dựa vào ngữ cảnh

QUY TẮC GIÁ VÉ:
- "rẻ nhất" / "giá thấp" / "cheapest" → maxPrice: null (sẽ sort theo giá tăng dần)
- "dưới 100k" / "under 100k" → maxPrice: 100000
- "dưới 200 nghìn" / "below 200k" → maxPrice: 200000
- "khoảng 150k" / "around 150k" → maxPrice: 180000 (thêm 20% buffer)
- "giá tốt" / "good price" → maxPrice: null

QUY TẮC LOẠI XE:
- "giường nằm" / "sleeper" / "bed" → busType: "giường nằm"
- "ghế ngồi" / "seat" / "sitting" → busType: "ghế ngồi"
- "limousine" / "limo" / "vip" → busType: "limousine"
- "xe phổ thông" / "standard" / "normal" → busType: "ghế ngồi"
- Nếu không nhắc → busType: null

QUY TẮC SỐ NGƯỜI:
- "1 người" / "mình tôi" / "solo" → passengers: 1
- "2 người" / "hai người" / "2 pax" → passengers: 2
- "gia đình 4 người" / "family of 4" → passengers: 4
- "cả nhà" / "whole family" → passengers: null (không biết cụ thể)
- Mặc định nếu không nhắc → passengers: null

QUY TẮC SỐ LƯỢNG KẾT QUẢ (QUAN TRỌNG):
- "tốt nhất" / "rẻ nhất" / "best" / "cheapest" / "giá tốt nhất" → limitResults: 1 (CHỈ 1 chuyến)
- "top 3" / "3 chuyến tốt nhất" / "top 3 cheapest" → limitResults: 3
- "top 5" / "5 chuyến" → limitResults: 5
- "vài chuyến" / "một vài" / "some" / "a few" → limitResults: 5
- "nhiều chuyến" / "all" / "tất cả" / "many" → limitResults: null (trả về tất cả, max 20)
- Mặc định nếu không nhắc → limitResults: 10 (chuẩn)

Câu: "${message}"

TRẢ VỀ JSON (không giải thích gì thêm):
{
  "origin": "tên chính xác như user gõ hoặc null",
  "destination": "tên chính xác như user gõ hoặc null", 
  "date": "YYYY-MM-DD hoặc null (null nếu quá khứ)",
  "time": "HH:MM hoặc null",
  "passengers": số người hoặc null,
  "busType": "loại xe hoặc null",
  "maxPrice": số tiền hoặc null,
  "limitResults": số lượng kết quả mong muốn (1, 3, 5, 10, hoặc null)
}`
      : `EXTRACT ONLY. DO NOT generate responses. Return pure JSON:

DATE RULES (HIGH PRIORITY):
- ⚠️ MOST IMPORTANT: If user does NOT mention a date → date: null
  Ex: "I want to go to Mê Linh" → date: null (NO date mentioned)
  Ex: "find trips to Chợ Cũ" → date: null (NO date mentioned)

- ONLY EXTRACT date when user ACTUALLY MENTIONS A DATE:
  * BASIC DATES:
    - "today" = "${today}"
    - "tomorrow" = "${tomorrow}"
    - "day after tomorrow" / "overmorrow" = "${dayAfterTomorrow}"
  
  * TIME OF DAY (extract date only, time = null if no specific hour mentioned):
    - "this morning" / "morning" → date: "${today}", time: null
    - "this afternoon" → date: "${today}", time: null
    - "tonight" / "this evening" → date: "${today}", time: null
    - "tomorrow morning" → date: "${tomorrow}", time: null
    - "tomorrow afternoon" → date: "${tomorrow}", time: null
    - "tomorrow night" → date: "${tomorrow}", time: null
  
  * DAYS OF WEEK:
    - "this Monday" / "Monday this week" → calculate this week's Monday (or next if passed)
    - "this Tuesday", "this Wednesday", "this Thursday", "this Friday", "this Saturday", "this Sunday" → same logic
    - "next Monday", "next Tuesday" → calculate next week's specific day
  
  * WEEK / MONTH:
    - "next week" → next Monday
    - "this weekend" → this Saturday
    - "next weekend" → next Saturday
    - "this week" → this Monday (if not passed) or today
    - "next month" → 1st day of next month
  
  * SPECIFIC TIMES:
    - "6 AM" / "6 in the morning" → time: "06:00"
    - "2 PM" / "2 in the afternoon" → time: "14:00"
    - "8 PM" / "8 at night" → time: "20:00"
    - "at 3:30 PM" → time: "15:30"
  
  * SPECIFIC DATES:
    - "January 5" / "Jan 5" → "2026-01-05" (current or next year if passed)
    - "05/01" / "5/1" → "2026-01-05"
    - "12/31" → "2025-12-31"
    - "12/30" → "2025-12-30" (ALWAYS EXTRACT even if past, chatbot will validate)
  
  * ⚠️ IMPORTANT: ALWAYS EXTRACT date if user mentions it, EVEN IF IT'S A PAST DATE
    The chatbot will check and warn the user if the date has passed

LOCATION RULES:
- IMPORTANT: If user types WITHOUT diacritics, automatically add proper Vietnamese diacritics
  Ex: "me linh" → "mê linh" | "cho cu" → "chợ cũ"
- Keep location names as typed (if already has accents)
- STOP CODES are valid: "BX 06", "Q1 020", "[BX 06]"
- If only 1 location, analyze if origin or destination from context

PRICE RULES:
- "cheapest" / "lowest price" → maxPrice: null (will sort by price ascending)
- "under 100k" / "below $100" → maxPrice: 100000
- "under 200k" → maxPrice: 200000
- "around 150k" → maxPrice: 180000 (add 20% buffer)
- "good price" → maxPrice: null

BUS TYPE RULES:
- "sleeper" / "bed" / "lie flat" → busType: "giường nằm"
- "seat" / "sitting" → busType: "ghế ngồi"
- "limousine" / "limo" / "VIP" → busType: "limousine"
- "standard" / "normal" → busType: "ghế ngồi"
- If not mentioned → busType: null

PASSENGER COUNT RULES:
- "1 person" / "solo" / "just me" → passengers: 1
- "2 people" / "two passengers" → passengers: 2
- "family of 4" → passengers: 4
- "whole family" → passengers: null (unknown count)
- Default if not mentioned → passengers: null

RESULT LIMIT RULES (IMPORTANT):
- "best" / "cheapest" / "best price" / "lowest price" → limitResults: 1 (ONLY 1 trip)
- "top 3" / "3 best" / "top 3 cheapest" → limitResults: 3
- "top 5" / "5 trips" → limitResults: 5
- "a few" / "some" / "several" → limitResults: 5
- "many" / "all" / "all trips" → limitResults: null (return all, max 20)
- Default if not mentioned → limitResults: 10 (standard)

Message: "${message}"

RETURN JSON (no explanation):
{
  "origin": "name with proper accents or null",
  "destination": "name with proper accents or null",
  "date": "YYYY-MM-DD or null (null if past date)",
  "time": "HH:MM or null",
  "passengers": number or null,
  "busType": "string or null",
  "maxPrice": number or null,
  "limitResults": desired number of results (1, 3, 5, 10, or null)
}

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
        systemPrompt: 'You are a JSON extraction machine. Your ONLY job is to return pure JSON. NEVER generate conversational responses. NEVER create fake data. NEVER add explanations. Return ONLY the JSON object with extracted parameters or empty values.',
        temperature: 0.1,
        maxTokens: 300
      });

      console.log('Raw Groq extraction response:', response);

      // Extract JSON from response, handle markdown code blocks
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '');
      }

      const params = JSON.parse(jsonStr);
      console.log('🔍 Extracted params:', params);

      // Ensure passengers is at least 1
      if (!params.passengers) {
        params.passengers = 1;
      }

      return params;
    } catch (error) {
      if (error.message.includes('quota')) {
        throw error; // Propagate quota errors to caller
      }
      
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to extract trip search parameters');
    }
  }
}

export const groqService = new GroqService();
