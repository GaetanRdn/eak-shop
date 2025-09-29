import { z } from 'zod';
import { CustomerSchema } from './customer';

export const OpportunityStageSchema = z.enum([
  'new',
  'qualified',
  'proposal',
  'won',
  'lost',
]);

export const OpportunitySchema = z.object({
  id: z.uuid(),
  customerId: CustomerSchema.shape.id,
  title: z.string(),
  stage: OpportunityStageSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;