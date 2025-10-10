import { Opportunity, Quote } from '@eak-shop/crm-models';

export interface QuotePort {
  create(
    payload: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Quote>;

  update(
    id: Quote['id'],
    payload: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Quote>;

  getByOpportunity(opportunityId: Opportunity['id']): Promise<Quote | undefined>;
}