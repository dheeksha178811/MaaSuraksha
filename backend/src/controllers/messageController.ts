import { Request, Response } from 'express';
import {
  MessageParticipantRole,
  createMessage,
  findOrCreateConversationForDoctor,
  findOrCreateConversationForMother,
  getConversationDetailForUser,
  listConversationsForUser,
} from '../services/messageService';
import { AuthError } from '../services/authService';
import { logger } from '../utils/logger';

function roleOf(req: Request): MessageParticipantRole | null {
  const role = req.user?.role;
  return role === 'doctor' || role === 'mother' ? role : null;
}

export async function getMyConversations(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }
  const role = roleOf(req);
  if (!role) {
    res.status(403).json({ success: false, message: 'Only doctors and mothers can use messaging.' });
    return;
  }

  try {
    const conversations = await listConversationsForUser(req.user.id, role);
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    logger.error('Fetch conversations failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch conversations.' });
  }
}

export async function getConversation(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }
  const role = roleOf(req);
  if (!role) {
    res.status(403).json({ success: false, message: 'Only doctors and mothers can use messaging.' });
    return;
  }

  try {
    const detail = await getConversationDetailForUser(req.user.id, role, req.params.conversationId);
    if (!detail) {
      res.status(404).json({ success: false, message: 'Conversation not found for this account.' });
      return;
    }
    res.status(200).json({ success: true, conversation: detail.conversation, messages: detail.messages });
  } catch (error) {
    logger.error('Fetch conversation detail failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch conversation.' });
  }
}

export async function postMessage(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }
  const role = roleOf(req);
  if (!role) {
    res.status(403).json({ success: false, message: 'Only doctors and mothers can use messaging.' });
    return;
  }

  try {
    const text = (req.body.text as string).trim();
    const message = await createMessage(req.user.id, role, req.params.conversationId, text);
    res.status(201).json({ success: true, message });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Send message failed', error);
    res.status(500).json({ success: false, message: 'Unable to send message.' });
  }
}

export async function postConversation(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }
  const role = roleOf(req);
  if (!role) {
    res.status(403).json({ success: false, message: 'Only doctors and mothers can use messaging.' });
    return;
  }

  try {
    let conversation;
    if (role === 'mother') {
      conversation = await findOrCreateConversationForMother(req.user.id);
    } else {
      const motherId = req.body.motherId as string | undefined;
      if (!motherId) {
        res.status(400).json({ success: false, message: 'motherId is required.' });
        return;
      }
      conversation = await findOrCreateConversationForDoctor(req.user.id, motherId);
    }
    res.status(201).json({ success: true, conversation });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Start conversation failed', error);
    res.status(500).json({ success: false, message: 'Unable to start conversation.' });
  }
}
