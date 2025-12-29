import { GET_DB } from '../config/prisma.js';
import { chatService } from '~/services/chatService.js';
import { StatusCodes } from 'http-status-codes';

export const chatController = {
  async handleChat(req, res, next) {
    try {
      const { message, userId } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Message is required and must be a string'
        });
      }

      // Get conversation context from session/request if available
      const context = {
        history: req.body.history || [],
        sessionId: req.body.sessionId || null
      };

      // Process message through chatService
      const result = await chatService.processMessage(message, userId, context);

      res.status(StatusCodes.OK).json({
        reply: result.reply,
        intent: result.intent,
        data: result.data
      });
    } catch (error) {
      console.error('Chat controller error:', error);
      next(error);
    }
  }
};
