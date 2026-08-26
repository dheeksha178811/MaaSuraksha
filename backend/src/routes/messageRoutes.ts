import { Router } from 'express';
import { getConversation, getMyConversations, postConversation, postMessage } from '../controllers/messageController';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validateConversationIdParam, validateSendMessage, validateStartConversation } from '../validators/messageValidators';

const router = Router();

router.get('/conversations', authenticate, requireRole('doctor', 'mother'), getMyConversations);
router.post('/conversations', authenticate, requireRole('doctor', 'mother'), validateStartConversation, postConversation);
router.get('/conversations/:conversationId', authenticate, requireRole('doctor', 'mother'), validateConversationIdParam, getConversation);
router.post(
  '/conversations/:conversationId/messages',
  authenticate,
  requireRole('doctor', 'mother'),
  validateSendMessage,
  postMessage
);

export default router;
