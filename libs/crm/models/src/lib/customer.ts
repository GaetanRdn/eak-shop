import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  company: z.string().optional(),
  createdAt: z.date(),
});

export type Customer = z.infer<typeof CustomerSchema>;