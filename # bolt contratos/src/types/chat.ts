import { z } from 'zod';

export const ChatStatus = {
  OPEN: 'open',
  PAUSED: 'paused',
  CLOSED: 'closed',
} as const;

export const chatSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['open', 'paused', 'closed']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  customerId: z.string(),
  assignedToId: z.string().nullable(),
  serviceOrderId: z.string().nullable(),
  lastMessage: z.string().nullable(),
  unreadCount: z.number(),
});

export const messageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  content: z.string(),
  senderId: z.string(),
  senderType: z.enum(['customer', 'agent']),
  createdAt: z.string().datetime(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional(),
});

export type Chat = z.infer<typeof chatSchema>;
export type Message = z.infer<typeof messageSchema>;