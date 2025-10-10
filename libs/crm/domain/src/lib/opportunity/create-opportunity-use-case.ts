import { OpportunityPort } from './opportunity-port';
import { Opportunity, OpportunitySchema } from '@eak-shop/crm-models';

export class CreateOpportunityUseCase {
  constructor(private readonly port: OpportunityPort) {}

  async execute(
    payload: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Opportunity> {
    const opportunity = await this.port.create(payload);
    return OpportunitySchema.parse(opportunity);
  }
}
