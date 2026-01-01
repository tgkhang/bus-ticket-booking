import { groqService } from './groqService.js'; // Using Groq 
// import { geminiService } from './geminiService.js'; // Backup: Gemini
import { tripModel } from '~/models/tripModel';
import { bookingModel } from '~/models/bookingModel';
import { stopModel } from '~/models/stopModel';
import { routeModel } from '~/models/routeModel';
import { operatorModel } from '~/models/operatorModel';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';

// Active AI service 
const aiService = groqService; // 14,400 req/day, 30 req/min
// const aiService = geminiService; // 20 req/day, 5 req/min

/**
 * Detect user language from message
 * @param {string} message - User's message
 * @returns {string} 'vi' or 'en'
 */
const detectLanguage = (message) => {
  // Default to English for short messages or system messages
  if (!message || message.length < 3) return 'en';
  
  // Check for Vietnamese characters (diacritics)
  const vietnameseDiacritics = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  if (vietnameseDiacritics.test(message)) return 'vi';
  
  // Check for common Vietnamese words (must have at least 2 matches to be confident)
  const vietnameseWords = message.match(/\b(tôi|mình|bạn|chuyến|xe|vé|đặt|kiểm|tra|hoàn|tiền|hủy|liên|hệ|hỗ|trợ|từ|đến|đi|của|không|có|được|như|thế|nào|muốn|cần|giúp)\b/gi);
  if (vietnameseWords && vietnameseWords.length >= 2) return 'vi';
  
  // Default to English
  return 'en';
};

/**
 * Detect user intent from message
 * @param {string} message - User's message
 * @returns {string} Intent type
 */
const detectIntent = (message) => {
  const msg = message.toLowerCase();

  // Booking status check
  if (/booking|check.*booking|order|tra.*cứu.*vé|kiểm.*tra.*đặt|mã.*đặt/i.test(message)) {
    return 'booking_status';
  }

  // Trip search - match many patterns (including "đặt chuyến", "muốn đặt")
  if (/search|find|trip|tìm.*chuyến|xe.*đi|chuyến.*xe|từ.*đến|muốn.*đi|muốn.*đến|đi.*đâu|tìm.*xe|xe.*buýt|đặt.*chuyến|muốn.*đặt.*chuyến/i.test(message)) {
    return 'trip_search';
  }

  // Booking assistance (only for booking existing trip)
  if (/book|đặt.*vé|mua.*vé|reserve/i.test(message)) {
    return 'booking_assistance';
  }

  // Refund/cancellation
  if (/refund|cancel|hoàn.*tiền|hủy.*vé/i.test(message)) {
    return 'refund';
  }

  // Contact/support
  if (/contact|support|help|liên.*hệ|hỗ.*trợ|hotline/i.test(message)) {
    return 'support';
  }

  // Routes/destinations - CHECK THIS FIRST before popular
  if (/route|destination|tuyến.*đường|tuyến.*nào|tuyến.*phổ.*biến|tuyến.*xe|đi.*được.*đâu|các.*tuyến/i.test(message)) {
    return 'routes';
  }

  // Popular operators/buses (NOT routes)
  if (/top.*operator|nhà.*xe.*phổ.*biến|nhà.*xe.*tốt|rating.*cao|đánh.*giá.*cao|xe.*nào.*tốt|nhà.*xe.*nào/i.test(message)) {
    return 'popular';
  }

  // General question - use AI
  return 'general';
};

/**
 * Detect intent using regex patterns (fallback when AI quota exceeded)
 */
const detectIntentWithRegex = (message) => {
  const messageLower = message.toLowerCase();

  // Trip search patterns (Vietnamese + English)
  if (
    /search|find|trip|book/i.test(message) ||
    /tìm.*chuyến|từ.*đến|muốn.*đi|đặt.*chuyến|xe.*đi|đi.*đến/i.test(message) ||
    /from\s+\w+\s+to\s+\w+/i.test(message) || // English: "from X to Y"
    /\b(đi|đến)\s+[a-zA-ZÀ-ỹ]+/i.test(message) // "đi X", "đến Y" - match Vietnamese letters
  ) {
    return 'trip_search';
  }

  // Booking status
  if (/booking|mã.*đặt|check.*booking|kiểm.*tra.*vé/i.test(message)) {
    return 'booking_status';
  }

  // Refund
  if (/refund|hoàn.*tiền|hủy.*vé|cancel/i.test(message)) {
    return 'refund';
  }

  // Support
  if (/support|hotline|liên.*hệ|contact|help/i.test(message)) {
    return 'support';
  }

  // Popular - CHECK FIRST (more specific)
  // Match: "chuyến/tuyến/xe + phổ biến/popular/top/best"
  if (/(?:chuyến|tuyến|xe|nhà.*xe).*(?:phổ.*biến|popular|top|best|tốt|rated)/i.test(message) ||
      /(?:phổ.*biến|popular|top|best|rated).*(?:chuyến|tuyến|xe|nhà.*xe)/i.test(message)) {
    return 'popular';
  }

  // Routes - CHECK AFTER popular (less specific)
  // Match: "tuyến/route" WITHOUT "phổ biến/popular"
  if (/(?:tuyến|route)(?!.*(?:phổ.*biến|popular|top|best|tốt|rated))/i.test(message)) {
    return 'routes';
  }

  return 'general';
};

/**
 * Simple regex-based extraction (fallback when AI quota exceeded)
 */
const extractParamsWithRegex = (message) => {
  // Match Vietnamese patterns: "từ X đến Y"
  const viFromToMatch = message.match(/từ\s+([^đến]+?)\s+đến\s+(.+)/i);
  if (viFromToMatch) {
    return {
      origin: viFromToMatch[1].trim(),
      destination: viFromToMatch[2].trim(),
      date: null,
      time: null,
      passengers: null,
      busType: null,
      maxPrice: null
    };
  }

  // Match English patterns: "from X to Y"
  const enFromToMatch = message.match(/from\s+([^to]+?)\s+to\s+(.+)/i);
  if (enFromToMatch) {
    return {
      origin: enFromToMatch[1].trim(),
      destination: enFromToMatch[2].trim(),
      date: null,
      time: null,
      passengers: null,
      busType: null,
      maxPrice: null
    };
  }

  // Match "đi [location]" or "đến [location]" or "đặt vé đi [location]"
  // Pattern matches: letters (with Vietnamese diacritics), numbers, spaces, brackets
  const destMatch = message.match(/(?:đi|đến|đặt.*(?:vé|chuyến)).*?([a-zA-ZÀ-ỹ0-9\s\[\]]+?)(?:\s+vào|\s+ngày|\s+lúc|$)/i);
  if (destMatch) {
    const location = destMatch[1].trim();
    // Ignore common words like "vào", "ngày", "lúc"
    if (location && !/^(vào|ngày|lúc|mốt|mai|nay)$/i.test(location)) {
      return {
        origin: null,
        destination: location,
        date: null,
        time: null,
        passengers: null,
        busType: null,
        maxPrice: null
      };
    }
  }

  return {
    origin: null,
    destination: null,
    date: null,
    time: null,
    passengers: null,
    busType: null,
    maxPrice: null
  };
};

/**
 * Handle trip search intent with AI
 * @param {string} message - User's message
 * @param {Object} context - Conversation context
 * @returns {Promise<Object>} Response object
 */
const handleTripSearch = async (message, context = {}) => {
  try {
    const lang = detectLanguage(message);
    
    let extractedParams;
    try {
      // AI extraction first
      extractedParams = await aiService.extractTripSearchIntent(message, lang);
      console.log('🤖AI Extraction:', JSON.stringify(extractedParams, null, 2));
      console.log(`Locations: origin="${extractedParams.origin}" | dest="${extractedParams.destination}"`);
      console.log(`Date extracted: "${extractedParams.date}" (${extractedParams.date ? 'SPECIFIC DATE' : 'NO DATE - will search all future'})`);
    } catch (error) {
      // Fallback to regex if AI fails (quota exceeded, etc.)
      console.warn('⚠️AI extraction FAILED, using regex fallback:', error.message);
      extractedParams = extractParamsWithRegex(message);
      console.log('📝Regex fallback result:', JSON.stringify(extractedParams, null, 2));
    }
    
    // Validate date if provided
    if (extractedParams.date) {
      // Use local date string comparison to avoid timezone issues
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      if (extractedParams.date < todayStr) {
        return {
          intent: 'trip_search',
          reply: lang === 'vi'
            ? `⚠️ Ngày ${extractedParams.date} đã qua rồi! Vui lòng chọn ngày từ hôm nay (${todayStr}) trở đi.`
            : `⚠️ The date ${extractedParams.date} is in the past! Please choose a date from today (${todayStr}) onwards.`,
          data: { trips: [], extractedParams }
        };
      }
    }
    
    let trips = [];
    let responseText = '';

    // If we have origin and/or destination, search trips
    if (extractedParams.origin || extractedParams.destination) {
      console.log(`Searching trips: origin=${extractedParams.origin}, dest=${extractedParams.destination}, date=${extractedParams.date || 'ANY FUTURE'}`);
      
      // Smart date handling:
      // - If user specified date: search that specific date
      // - If no date: pass null to search all future dates
      const searchDate = extractedParams.date || null;
      
      // Smart limit handling based on user intent
      // "best" / "cheapest" → 1 trip, "top 3" → 3 trips, default → 10 trips
      const limit = extractedParams.limitResults !== undefined ? extractedParams.limitResults : 10;
      const actualLimit = limit === null ? 20 : limit; // null means "all" (max 20)
      
      trips = await tripModel.searchTripsByCityNames(
        extractedParams.origin,
        extractedParams.destination,
        searchDate,
        {
          maxPrice: extractedParams.maxPrice,
          busType: extractedParams.busType,
          limit: actualLimit
        }
      );
      
      // database query filters future trips
      console.log(`Found ${trips.length} future trips from database`);

      if (trips.length > 0) {
        // Only show header message
        let header = '';
        const destName = extractedParams.destination || '';
        const originName = extractedParams.origin || '';
        const isSingleResult = extractedParams.limitResults === 1;
        
        if (originName && destName) {
          if (isSingleResult && trips.length === 1) {
            header = lang === 'vi' 
              ? `Đây là chuyến xe tốt nhất từ ${originName} đến ${destName}:`
              : `Here is the best trip from ${originName} to ${destName}:`;
          } else {
            header = lang === 'vi' 
              ? `Tôi tìm thấy ${trips.length} chuyến xe từ ${originName} đến ${destName}:`
              : `I found ${trips.length} trips from ${originName} to ${destName}:`;
          }
        } else if (destName) {
          if (isSingleResult && trips.length === 1) {
            header = lang === 'vi' 
              ? `Đây là chuyến xe tốt nhất đến ${destName}:`
              : `Here is the best trip to ${destName}:`;
          } else {
            header = lang === 'vi' 
              ? `Tôi tìm thấy ${trips.length} chuyến xe đến ${destName}:`
              : `I found ${trips.length} trips to ${destName}:`;
          }
        } else if (originName) {
          if (isSingleResult && trips.length === 1) {
            header = lang === 'vi' 
              ? `Đây là chuyến xe tốt nhất từ ${originName}:`
              : `Here is the best trip from ${originName}:`;
          } else {
            header = lang === 'vi' 
              ? `Tôi tìm thấy ${trips.length} chuyến xe từ ${originName}:`
              : `I found ${trips.length} trips from ${originName}:`;
          }
        }

        responseText = header;
        console.log('Header message generated:', header);
      } else {
        // No trips found - provide smart suggestions with specific details
        const searchInfo = extractedParams.date 
          ? `vào ${new Date(extractedParams.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}`
          : 'trong tương lai';
        
        responseText = lang === 'vi'
          ? `Hiện không có chuyến xe ${extractedParams.origin ? 'từ ' + extractedParams.origin : ''} ${extractedParams.destination ? 'đến ' + extractedParams.destination : ''} ${searchInfo}.\n\nBạn có thể:\n- Chọn ngày khác\n- Thử điểm xuất phát/đến gần đó\n- Xem các tuyến phổ biến`
          : `No trips found ${extractedParams.origin ? 'from ' + extractedParams.origin : ''} ${extractedParams.destination ? 'to ' + extractedParams.destination : ''} ${extractedParams.date ? 'on ' + new Date(extractedParams.date).toLocaleDateString('en-US') : 'in the future'}.\n\nYou can:\n- Try a different date\n- Search nearby locations\n- View popular routes`;
      }
    } else {
      // No location info - ask for it directly
      responseText = lang === 'vi'
        ? 'Bạn muốn tìm chuyến xe đi đâu? Vui lòng cho biết điểm đến hoặc cả điểm đi và điểm đến.'
        : 'Where would you like to go? Please provide your destination or both origin and destination.';
    }

    return {
      intent: 'trip_search',
      reply: responseText,
      data: {
        trips: trips.map(t => ({
          id: t.id,
          route: `${t.route.originStop.name} - ${t.route.destinationStop.name}`,
          departureTime: t.departureTime,
          price: t.basePrice,
          availableSeats: t.availableSeats
        })),
        extractedParams
      }
    };
  } catch (error) {
    console.error('Trip search error:', error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to search trips');
  }
};

/**
 * Handle booking status check
 * @param {string} message - User's message
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response object
 */
const handleBookingStatus = async (message, userId) => {
  try {
    const lang = detectLanguage(message);
    
    if (!userId) {
      return {
        intent: 'booking_status',
        reply: lang === 'vi' 
          ? 'Bạn cần đăng nhập để kiểm tra trạng thái đặt vé. Vui lòng đăng nhập và thử lại.'
          : 'You need to login to check your booking status. Please login and try again.',
        data: null
      };
    }

    // Check if user provided booking code
    const codeMatch = message.match(/[A-Z0-9]{6,}/);
    let booking = null;

    if (codeMatch) {
      // Search by booking code
      booking = await bookingModel.getBookingByCode(codeMatch[0]);
    } else {
      // Get latest booking
      booking = await bookingModel.getUserLatestBooking(userId);
    }

    if (booking) {
      const route = `${booking.trip.route.originStop.name} → ${booking.trip.route.destinationStop.name}`;
      const departureTime = new Date(booking.trip.departureTime).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      let statusText = '';
      if (lang === 'vi') {
        switch (booking.status) {
          case 'pending':
            statusText = 'Chờ thanh toán';
            break;
          case 'confirmed':
            statusText = 'Đã xác nhận';
            break;
          case 'cancelled':
            statusText = 'Đã hủy';
            break;
          case 'completed':
            statusText = 'Hoàn thành';
            break;
          default:
            statusText = booking.status;
        }
      } else {
        switch (booking.status) {
          case 'pending':
            statusText = 'Pending Payment';
            break;
          case 'confirmed':
            statusText = 'Confirmed';
            break;
          case 'cancelled':
            statusText = 'Cancelled';
            break;
          case 'completed':
            statusText = 'Completed';
            break;
          default:
            statusText = booking.status;
        }
      }

      const replyText = lang === 'vi'
        ? `🎟️ **Thông tin vé của bạn**\n\n**Tuyến:** ${route}  \n**Khởi hành:** ${departureTime}  \n**Mã:** ${booking.code}  \n**Trạng thái:** ${statusText}  \n**Tổng tiền:** ${booking.totalAmount.toLocaleString('vi-VN')}đ  \n**Hành khách:** ${booking.passengerDetails.length} người${booking.status === 'pending' ? '\n\n⚠️ Vui lòng hoàn tất thanh toán để xác nhận vé.' : ''}`
        : `🎟️ **Your Booking Details**\n\n**Route:** ${route}  \n**Departure:** ${departureTime}  \n**Code:** ${booking.code}  \n**Status:** ${statusText}  \n**Total:** ${booking.totalAmount.toLocaleString('en-US')} VND  \n**Passengers:** ${booking.passengerDetails.length}${booking.status === 'pending' ? '\n\n⚠️ Please complete payment to confirm your booking.' : ''}`;

      return {
        intent: 'booking_status',
        reply: replyText,
        data: {
          bookingId: booking.id,
          code: booking.code,
          status: booking.status,
          route,
          departureTime: booking.trip.departureTime,
          totalAmount: booking.totalAmount
        }
      };
    } else {
      return {
        intent: 'booking_status',
        reply: lang === 'vi'
          ? 'Không tìm thấy thông tin đặt vé. Bạn chưa có vé nào hoặc mã vé không đúng.'
          : 'No booking found. You have no bookings yet or the booking code is incorrect.',
        data: null
      };
    }
  } catch (error) {
    console.error('Booking status error:', error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to check booking status');
  }
};

/**
 * Handle booking assistance
 * @param {string} message - User's message
 * @param {Object} context - Conversation context
 * @returns {Promise<Object>} Response object
 */
const handleBookingAssistance = async (message, context = {}) => {
  try {
    const aiResponse = await geminiService.generateResponse(message, {
      systemPrompt: `You are a booking assistant. Help users book bus tickets step by step:
1. Confirm trip selection (if not already selected)
2. Guide them to select seats
3. Ask for passenger details
4. Explain payment process

Be friendly and clear. Respond in Vietnamese. Keep responses concise.`
    });

    return {
      intent: 'booking_assistance',
      reply: aiResponse,
      data: {
        requiresAction: true,
        nextStep: 'trip_selection'
      }
    };
  } catch (error) {
    console.error('Booking assistance error:', error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to assist with booking');
  }
};

/**
 * Handle general queries with AI
 * @param {string} message - User's message
 * @param {Object} context - Conversation context
 * @returns {Promise<Object>} Response object
 */
const handleGeneralQuery = async (message, context = {}) => {
  try {
    const lang = detectLanguage(message);
    
    // DO NOT use AI for responses - only provide menu options
    const reply = lang === 'vi'
      ? `Xin chào! Tôi có thể giúp bạn:

🔍 Tìm chuyến xe
📋 Kiểm tra vé đã đặt
💰 Chính sách hoàn tiền
📞 Liên hệ hỗ trợ

Bạn cần giúp gì?`
      : `Hello! I can help you with:

🔍 Search trips
📋 Check bookings
💰 Refund policy
📞 Contact support

What do you need?`;

    return {
      intent: 'general',
      reply: reply,
      data: null
    };
  } catch (error) {
    console.error('General query error:', error);
    const lang = detectLanguage(message);
    // Fallback response if AI fails
    return {
      intent: 'general',
      reply: lang === 'vi'
        ? 'Xin lỗi, tôi đang gặp sự cố. Bạn có thể:  \n- Tìm chuyến xe  \n- Kiểm tra vé đã đặt  \n- Liên hệ hotline: 1900-123-456'
        : 'Sorry, I\'m having some issues. You can:  \n- Search for trips  \n- Check your bookings  \n- Contact hotline: 1900-123-456',
      data: null
    };
  }
};

/**
 * Main chat handler - routes to appropriate intent handler
 * @param {string} message - User's message
 * @param {string} userId - User ID (optional)
 * @param {Object} context - Conversation context
 * @returns {Promise<Object>} Response object
 */
const processMessage = async (message, userId = null, context = {}) => {
  try {
    // Strategy: Try AI first (smart), fallback to regex if quota exceeded
    const lang = detectLanguage(message);
    let intent;
    let usingAI = false;
    
    try {
      intent = await aiService.detectIntent(message, lang);
      usingAI = true;
      console.log(`🤖AI detected intent: ${intent} for "${message}"`);
    } catch (aiError) {
      // Fallback to regex when AI quota exceeded
      console.warn('⚠️AI quota exceeded, using regex fallback');
      intent = detectIntentWithRegex(message);
      console.log(`📝Regex detected intent: ${intent} for "${message}"`);
    }

    switch (intent) {
      case 'trip_search':
        return await handleTripSearch(message, context);

      case 'booking_status':
        return await handleBookingStatus(message, userId);

      case 'booking_assistance':
        return await handleBookingAssistance(message, context);

      case 'refund': {
        const lang = detectLanguage(message);
        return {
          intent: 'refund',
          reply: lang === 'vi'
            ? '� **Chính sách hoàn tiền**\n\n• **Hủy trước 24h:** Hoàn 80% refund  \n• **Hủy trước 12h:** Hoàn 50% refund  \n• **Hủy trong 12h:** No refund\n\n**Cách yêu cầu hủy vé:**  \n1. Vào "Vé của tôi"  \n2. Chọn vé cần hủy  \n3. Nhấn "Yêu cầu hủy vé"\n\n**Liên hệ:** 1900-123-456'
            : '📋 **Refund Policy**\n\n• **Cancel before 24h:** 80% refund  \n• **Cancel before 12h:** 50% refund  \n• **Cancel within 12h:** No refund\n\n**How to cancel:**  \n1. Go to "My Tickets"  \n2. Select ticket to cancel  \n3. Click "Request Cancellation"\n\n**Contact:** 1900-123-456',
          data: null
        };
      }

      case 'support': {
        const lang = detectLanguage(message);
        return {
          intent: 'support',
          reply: lang === 'vi'
            ? '📞 **Hỗ trợ khách hàng**\n\n**Hotline:** +84 123 456 789  \n**Email:** support@busbooking.com  \n**Địa chỉ:** 123 Main Street, District 1, Ho Chi Minh City, Vietnam  \n**Giờ làm việc:** 24/7\n\nBạn cần hỗ trợ về vấn đề gì?'
            : '📞 **Customer Support**\n\n**Hotline:** +84 123 456 789  \n**Email:** support@busbooking.com  \n**Address:** 123 Main Street, District 1, Ho Chi Minh City, Vietnam  \n**Hours:** 24/7\n\nWhat can I help you with?',
          data: null
        };
      }

      case 'routes': {
        const lang = detectLanguage(message);
        try {
          const popularRoutes = await routeModel.getPopularRoutes(5);
          
          if (popularRoutes && popularRoutes.length > 0) {
            const routeList = popularRoutes.map((route, idx) => {
              const origin = route.from || 'N/A';
              const dest = route.to || 'N/A';
              const bookings = route.bookings || 0;
              return lang === 'vi'
                ? `${idx + 1}. **${origin}** \u2192 **${dest}** (${bookings} l\u01b0\u1ee3t \u0111\u1eb7t)`
                : `${idx + 1}. **${origin}** \u2192 **${dest}** (${bookings} bookings)`;
            }).join('  \n');
            
            return {
              intent: 'routes',
              reply: lang === 'vi'
                ? `🚌 **Tuyến phổ biến**\n\n${routeList}\n\nBạn muốn tìm chuyến nào?`
                : `🚌 **Popular Routes**\n\n${routeList}\n\nWhich route would you like?`,
              data: { routes: popularRoutes }
            };
          }
        } catch (error) {
          console.error('Error fetching popular routes:', error);
        }
        
        // Fallback - encourage search
        return {
          intent: 'routes',
          reply: lang === 'vi'
            ? '🚌 Tuyến xe có sẵn\n\nHiện tại chúng tôi có nhiều tuyến xe nội thành TP.HCM.\n\nBạn muốn đi đâu? Hãy nói với tôi điểm đến!'
            : '🚌 Available Routes\n\nWe have many routes within Ho Chi Minh City.\n\nWhere would you like to go? Tell me your destination!',
          data: null
        };
      }

      case 'popular': {
        const lang = detectLanguage(message);
        try {
          const topOperators = await operatorModel.getTopRatedOperators(5);
          
          if (topOperators && topOperators.length > 0) {
            const operatorList = topOperators.map((op, idx) => {
              const rating = op.rating ? `⭐ ${op.rating.toFixed(1)}` : 'Chưa có đánh giá';
              return lang === 'vi'
                ? `${idx + 1}. **${op.name}**  \n   ${rating} • ${op.totalTrips || 0} chuyến  \n   📞 ${op.phone || 'N/A'}`
                : `${idx + 1}. **${op.name}**  \n   ${rating} • ${op.totalTrips || 0} trips  \n   📞 ${op.phone || 'N/A'}`;
            }).join('\n\n');
            
            return {
              intent: 'popular',
              reply: lang === 'vi'
                ? `⭐ **Nhà xe được đánh giá cao**\n\n${operatorList}\n\nBạn muốn đặt vé nhà xe nào?`
                : `⭐ **Top Rated Operators**\n\n${operatorList}\n\nWhich operator would you like to book?`,
              data: { operators: topOperators }
            };
          }
        } catch (error) {
          console.error('Error fetching top operators:', error);
        }
        
        // Fallback
        return {
          intent: 'popular',
          reply: lang === 'vi'
            ? '⭐ Thông tin về nhà xe phổ biến đang được cập nhật. Bạn có thể tìm chuyến xe theo tuyến đường hoặc liên hệ hotline để được tư vấn!'
            : '⭐ Popular operator information is being updated. You can search for trips by route or contact our hotline for assistance!',
          data: null
        };
      }

      case 'general':
      default:
        return await handleGeneralQuery(message, context);
    }
  } catch (error) {
    console.error('Chat processing error:', error);
    throw error;
  }
};

export const chatService = {
  processMessage,
  detectIntent,
  handleTripSearch,
  handleBookingStatus,
  handleBookingAssistance,
  handleGeneralQuery,
};
