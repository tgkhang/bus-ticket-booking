import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface Message {
  sender: 'User' | 'AI';
  text: string;
  timestamp: Date;
  intent?: string;
  data?: any;
}

interface UseChatSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (message: string, history?: any[]) => void;
  messages: Message[];
  isTyping: boolean;
}

export function useChatSocket(isOpen: boolean): UseChatSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'AI', text: 'Hello! How can I help you today?', timestamp: new Date() },
    { sender: 'AI', text: 'Ask about trip search, booking status, refunds, or anything else!', timestamp: new Date() },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Get access token from cookies
    const getAccessToken = () => {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(c => c.trim().startsWith('accessToken='));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    };

    const token = getAccessToken();
    console.log('🔑 Chat socket connecting. Token:', token ? 'Present' : 'Missing');

    // Connect to backend socket server
    const API_SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010';
    socketRef.current = io(API_SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: token ? { token } : undefined,
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Listen for AI messages
    socketRef.current.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setIsTyping(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen]);

  const sendMessage = (text: string, history: any[] = []) => {
    if (!socketRef.current || !text.trim()) return;

    // Add user message to UI
    const userMessage: Message = {
      sender: 'User',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);

    // Emit to backend
    socketRef.current.emit('message', {
      text: text.trim(),
      history,
      sessionId: null, // Can add session management later
    });
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    messages,
    isTyping,
  };
}
