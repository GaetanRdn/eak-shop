import { Opportunity, Quote, QuoteSchema } from '@eak-shop/crm-models';
import { QuotePort } from './quote-port';

export class GetQuoteByOpportunityUseCase {
  constructor(private readonly port: QuotePort) {}

  async execute(opportunityId: Opportunity['id']): Promise<Quote | undefined> {
    const quote = await this.port.getByOpportunity(opportunityId);
    if (!quote) {
      return undefined;
    }
    return QuoteSchema.parse(quote);
  }
}