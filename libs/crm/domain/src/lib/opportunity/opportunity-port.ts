import { Customer, Opportunity } from '@eak-shop/crm-models';

export interface OpportunityPort {
  create(
    payload: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Opportunity>;

  getByCustomer(customerId: Customer['id']): Promise<Opportunity[]>;
}
