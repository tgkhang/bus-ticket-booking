import { geminiService } from './geminiService.js';
import { tripModel } from '~/models/tripModel';
import { bookingModel } from '~/models/bookingModel';
import { stopModel } from '~/models/stopModel';
import { routeModel } from '~/models/routeModel';
import { operatorModel } from '~/models/operatorModel';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';

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
 * Simple regex-based extraction (fallback when AI quota exceeded)
 */
const extractParamsWithRegex = (message) => {
  // Match patterns like "từ X đến Y", "đi X", "BX 06", etc.
  const fromToMatch = message.match(/từ\s+([^đến]+?)\s+đến\s+(.+)/i);
  if (fromToMatch) {
    return {
      origin: fromToMatch[1].trim(),
      destination: fromToMatch[2].trim(),
      date: null,
      time: null,
      passengers: null,
      busType: null,
      maxPrice: null
    };
  }

  // Match "đi [location]" or "đến [location]" or just a stop code
  const destMatch = message.match(/(?:đi|đến|đặt.*chuyến)\s+([A-Z0-9\s\[\]]+)/i);
  if (destMatch) {
    return {
      origin: null,
      destination: destMatch[1].trim(),
      date: null,
      time: null,
      passengers: null,
      busType: null,
      maxPrice: null
    };
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
      // Try AI extraction first
      extractedParams = await geminiService.extractTripSearchIntent(message, lang);
      console.log('AI Extraction result:', JSON.stringify(extractedParams, null, 2));
    } catch (error) {
      // Fallback to regex if AI fails (quota exceeded, etc.)
      console.log('AI extraction failed, using regex fallback:', error.message);
      extractedParams = extractParamsWithRegex(message);
      console.log('Regex Extraction result:', JSON.stringify(extractedParams, null, 2));
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
      
      trips = await tripModel.searchTripsByCityNames(
        extractedParams.origin,
        extractedParams.destination,
        searchDate,
        {
          maxPrice: extractedParams.maxPrice,
          busType: extractedParams.busType,
          limit: 10 
        }
      );
      
      // database query filters future trips
      console.log(`Found ${trips.length} future trips from database`);

      if (trips.length > 0) {
        // Format trip results based on language
        const tripList = trips.map((trip, index) => {
          const route = `${trip.route.originStop.name} → ${trip.route.destinationStop.name}`;
          const time = new Date(trip.departureTime).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
          });
          const price = trip.basePrice.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US');
          
          if (lang === 'vi') {
            return `${index + 1}. ${route}\n   Khởi hành: ${time}\n   Giá: ${price}đ\n   Chỗ trống: ${trip.availableSeats} ghế\n   Nhà xe: ${trip.bus.operator.name}`;
          } else {
            return `${index + 1}. ${route}\n   Departure: ${time}\n   Price: ${price} VND\n   Available: ${trip.availableSeats} seats\n   Operator: ${trip.bus.operator.name}`;
          }
        }).join('\n\n');

        let header = '';
        if (extractedParams.origin && extractedParams.destination) {
          header = lang === 'vi' 
            ? `Tôi tìm thấy ${trips.length} chuyến xe từ ${extractedParams.origin} đến ${extractedParams.destination}:`
            : `I found ${trips.length} trips from ${extractedParams.origin} to ${extractedParams.destination}:`;
        } else if (extractedParams.destination) {
          header = lang === 'vi' 
            ? `Tôi tìm thấy ${trips.length} chuyến xe đến ${extractedParams.destination}:`
            : `I found ${trips.length} trips to ${extractedParams.destination}:`;
        } else if (extractedParams.origin) {
          header = lang === 'vi' 
            ? `Tôi tìm thấy ${trips.length} chuyến xe từ ${extractedParams.origin}:`
            : `I found ${trips.length} trips from ${extractedParams.origin}:`;
        }

        responseText = `${header}\n\n${tripList}\n\n${lang === 'vi' ? 'Bạn muốn đặt vé chuyến nào?' : 'Which trip would you like to book?'}`;
        console.log('Response text generated from database trips (first 200 chars):', responseText.substring(0, 200));
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
        ? `🎟️ Thông tin vé của bạn\n\nTuyến: ${route}\nKhởi hành: ${departureTime}\nMã: ${booking.code}\nTrạng thái: ${statusText}\nTổng tiền: ${booking.totalAmount.toLocaleString('vi-VN')}đ\nHành khách: ${booking.passengerDetails.length} người\n${booking.status === 'pending' ? '\n⚠️ Vui lòng hoàn tất thanh toán để xác nhận vé.' : ''}`
        : `🎟️ Your Booking Details\n\nRoute: ${route}\nDeparture: ${departureTime}\nCode: ${booking.code}\nStatus: ${statusText}\nTotal: ${booking.totalAmount.toLocaleString('en-US')} VND\nPassengers: ${booking.passengerDetails.length}\n${booking.status === 'pending' ? '\n⚠️ Please complete payment to confirm your booking.' : ''}`;

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
        ? 'Xin lỗi, tôi đang gặp sự cố. Bạn có thể:\n- Tìm chuyến xe\n- Kiểm tra vé đã đặt\n- Liên hệ hotline: 1900-123-456'
        : 'Sorry, I\'m having some issues. You can:\n- Search for trips\n- Check your bookings\n- Contact hotline: 1900-123-456',
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
    const intent = detectIntent(message);
    console.log(`Message: "${message}" → Intent: ${intent}`);

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
            ? '🔄 Chính sách hoàn tiền\n\n• Hủy trước 24h: Hoàn 80%\n• Hủy trước 12h: Hoàn 50%\n• Hủy trong 12h: Không hoàn tiền\n\nCách yêu cầu hủy vé:\n1. Vào "Vé của tôi"\n2. Chọn vé cần hủy\n3. Nhấn "Yêu cầu hủy vé"\n\nLiên hệ: 1900-123-456'
            : '🔄 Refund Policy\n\n• Cancel before 24h: 80% refund\n• Cancel before 12h: 50% refund\n• Cancel within 12h: No refund\n\nHow to cancel:\n1. Go to "My Tickets"\n2. Select ticket to cancel\n3. Click "Request Cancellation"\n\nContact: 1900-123-456',
          data: null
        };
      }

      case 'support': {
        const lang = detectLanguage(message);
        return {
          intent: 'support',
          reply: lang === 'vi'
            ? '📞 Hỗ trợ khách hàng\n\nHotline: +84 123 456 789\nEmail: support@busbooking.com\nĐịa chỉ: 123 Main Street, District 1, Ho Chi Minh City, Vietnam\nGiờ làm việc: 24/7\n\nBạn cần hỗ trợ về vấn đề gì?'
            : '📞 Customer Support\n\nHotline: +84 123 456 789\nEmail: support@busbooking.com\nAddress: 123 Main Street, District 1, Ho Chi Minh City, Vietnam\nHours: 24/7\n\nWhat can I help you with?',
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
                ? `${idx + 1}. ${origin} \u2192 ${dest} (${bookings} l\u01b0\u1ee3t \u0111\u1eb7t)`
                : `${idx + 1}. ${origin} \u2192 ${dest} (${bookings} bookings)`;
            }).join('\n');
            
            return {
              intent: 'routes',
              reply: lang === 'vi'
                ? `🚌 Tuyến phổ biến\n\n${routeList}\n\nBạn muốn tìm chuyến nào?`
                : `🚌 Popular Routes\n\n${routeList}\n\nWhich route would you like?`,
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
                ? `${idx + 1}. ${op.name}\n   ${rating} • ${op.totalTrips || 0} chuyến\n   📞 ${op.phone || 'N/A'}`
                : `${idx + 1}. ${op.name}\n   ${rating} • ${op.totalTrips || 0} trips\n   📞 ${op.phone || 'N/A'}`;
            }).join('\n\n');
            
            return {
              intent: 'popular',
              reply: lang === 'vi'
                ? `⭐ Nhà xe được đánh giá cao\n\n${operatorList}\n\nBạn muốn đặt vé nhà xe nào?`
                : `⭐ Top Rated Operators\n\n${operatorList}\n\nWhich operator would you like to book?`,
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
