import { geminiService } from './geminiService.js';
import { tripModel } from '~/models/tripModel';
import { bookingModel } from '~/models/bookingModel';
import { stopModel } from '~/models/stopModel';
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

  // Trip search
  if (/search|find|trip|tìm.*chuyến|xe.*đi|chuyến.*xe|từ.*đến|muốn.*đi/i.test(message)) {
    return 'trip_search';
  }

  // Booking assistance
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

  // Routes/popular destinations
  if (/route|popular|tuyến.*đường|tuyến.*phổ.*biến/i.test(message)) {
    return 'routes';
  }

  // General question - use AI
  return 'general';
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
    
    // Use AI to extract trip search parameters
    const extractedParams = await geminiService.extractTripSearchIntent(message, lang);
    
    let trips = [];
    let responseText = '';

    // If we have origin and/or destination, search trips
    if (extractedParams.origin || extractedParams.destination) {
      trips = await tripModel.searchTripsByCityNames(
        extractedParams.origin,
        extractedParams.destination,
        extractedParams.date,
        {
          maxPrice: extractedParams.maxPrice,
          busType: extractedParams.busType,
          limit: 5
        }
      );

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

        responseText = lang === 'vi' 
          ? `Tôi tìm thấy ${trips.length} chuyến xe phù hợp:\n\n${tripList}\n\nBạn muốn đặt vé chuyến nào? Hoặc cần tìm kiếm thêm không?`
          : `I found ${trips.length} available trips:\n\n${tripList}\n\nWhich trip would you like to book? Or would you like to search more?`;
      } else {
        responseText = lang === 'vi'
          ? `Xin lỗi, tôi không tìm thấy chuyến xe nào phù hợp với yêu cầu của bạn.\n\nBạn có thể thử:\n- Thay đổi ngày đi\n- Kiểm tra lại tên thành phố\n- Bỏ bớt điều kiện lọc`
          : `Sorry, I couldn't find any trips matching your request.\n\nYou could try:\n- Changing the travel date\n- Checking the city names\n- Removing some filters`;
      }
    } else {
      // Not enough info - ask AI to help
      const aiResponse = await geminiService.generateResponse(message, {
        systemPrompt: lang === 'vi'
          ? `Bạn là trợ lý đặt vé xe. Người dùng muốn tìm chuyến xe nhưng chưa cung cấp đủ thông tin. Hỏi họ: thành phố xuất phát, thành phố đến, và ngày đi. Hãy thân thiện và lịch sự.`
          : `You are a bus booking assistant. The user wants to search for trips but hasn't provided complete information. Ask them for: origin city, destination city, and travel date. Be friendly and helpful.`
      });
      responseText = aiResponse;
    }

    return {
      intent: 'trip_search',
      reply: responseText,
      data: {
        trips: trips.slice(0, 3).map(t => ({
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
    const aiResponse = await geminiService.generateResponse(message, {
      ...context,
      systemPrompt: context.systemPrompt || geminiService.getDefaultSystemPrompt(lang)
    });

    return {
      intent: 'general',
      reply: aiResponse,
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
        return {
          intent: 'routes',
          reply: lang === 'vi'
            ? '🚌 Tuyến phổ biến\n\n1. TP.HCM → Đà Nẵng\n2. TP.HCM → Nha Trang\n3. TP.HCM → Đà Lạt\n4. Hà Nội → Hải Phòng\n5. Hà Nội → Sapa\n\nBạn muốn tìm tuyến nào?'
            : '🚌 Popular Routes\n\n1. Ho Chi Minh City → Da Nang\n2. Ho Chi Minh City → Nha Trang\n3. Ho Chi Minh City → Da Lat\n4. Hanoi → Hai Phong\n5. Hanoi → Sapa\n\nWhich route would you like?',
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
