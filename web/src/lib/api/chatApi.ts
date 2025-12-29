import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010';

interface ChatMessage {
  message: string;
  userId?: string;
  history?: any[];
  sessionId?: string;
}

interface ChatResponse {
  reply: string;
  intent: string;
  data?: any;
}

/**
 * Send chat message via REST API (alternative to socket.io)
 * Use this when you need a one-off request instead of persistent connection
 */
export async function sendChatMessage(payload: ChatMessage): Promise<ChatResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/chat`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    return response.data;
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}

/**
 * Get chat history (if implemented on backend)
 */
export async function getChatHistory(userId: string, limit = 20): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/chat/history`, {
      params: { userId, limit },
    });

    return response.data;
  } catch (error) {
    console.error('Chat history API error:', error);
    return [];
  }
}

export const chatApi = {
  sendMessage: sendChatMessage,
  getHistory: getChatHistory,
};
