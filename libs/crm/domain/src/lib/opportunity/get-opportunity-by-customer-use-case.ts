import { OpportunityPort } from './opportunity-port';
import { Customer, Opportunity, OpportunitySchema } from '@eak-shop/crm-models';
import { z } from 'zod';

export class GetOpportunityByCustomerUseCase {
  constructor(private readonly port: OpportunityPort) {}

  async execute(customerId: Customer['id']): Promise<Opportunity[]> {
    const opportunities = await this.port.getByCustomer(customerId);
    return z.array(OpportunitySchema).parse(opportunities);
  }
}
