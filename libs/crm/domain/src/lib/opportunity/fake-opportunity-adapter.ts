import { OpportunityPort } from './opportunity-port';
import { Customer, Opportunity } from '@eak-shop/crm-models';

export class FakeOpportunityAdapter implements OpportunityPort {
  private opportunities: Opportunity[] = [];

  setOpportunity(opportunity: Opportunity) {
    this.opportunities = [opportunity];
  }

  setOpportunities(opportunities: Opportunity[]) {
    this.opportunities = opportunities;
  }

  async create(
    payload: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Opportunity> {
    const now = new Date();
    const opportunity: Opportunity = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.opportunities.push(opportunity);
    return opportunity;
  }

  async getByCustomer(customerId: Customer['id']): Promise<Opportunity[]> {
    return this.opportunities.filter(opportunity => opportunity.customerId === customerId);
  }
}
