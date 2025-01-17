import { z } from 'zod';

export const ServiceOrderStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_APPROVAL: 'waiting_approval',
  COMPLETED: 'completed',
} as const;

export type ServiceOrderStatus = keyof typeof ServiceOrderStatus;

export const serviceOrderSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  serviceType: z.string(),
  status: z.enum(['open', 'in_progress', 'waiting_approval', 'completed']),
  openedAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
  customer: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    email: z.string(),
  }),
  priority: z.enum(['low', 'medium', 'high']),
  assignedTo: z.string().nullable(),
});

export type ServiceOrder = z.infer<typeof serviceOrderSchema>;

export interface ServiceOrderAction {
  id: string;
  type: 'call' | 'remote' | 'approval' | 'schedule';
  timestamp: string;
  details: string;
}