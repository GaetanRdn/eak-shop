import { Quote, QuoteSchema } from '@eak-shop/crm-models';
import { QuotePort } from './quote-port';

export class CreateQuoteUseCase {
  constructor(private readonly port: QuotePort) {}

  async execute(
    payload: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Quote> {
    const quote = await this.port.create(payload);
    return QuoteSchema.parse(quote);
  }
}