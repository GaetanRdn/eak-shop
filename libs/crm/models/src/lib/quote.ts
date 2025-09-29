import { z } from 'zod';
import { OpportunitySchema } from './opportunity';

export const QuoteLineSchema = z.object({
  refArticle: z.string(),
  label: z.string(),
  unitPrice: z.number(),
  quantity: z.number(),
});

export const QuoteSchema = z.object({
  id: z.uuid(),
  opportunityId: OpportunitySchema.shape.id,
  lines: z.array(QuoteLineSchema),
  discountRate: z.number().optional(),
  vatRate: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Quote = z.infer<typeof QuoteSchema>;
