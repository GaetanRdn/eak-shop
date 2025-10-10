import { Quote, QuoteSchema } from '@eak-shop/crm-models';
import { QuotePort } from './quote-port';

export class UpdateQuoteUseCase {
  constructor(private readonly port: QuotePort) {}

  async execute(
    id: Quote['id'],
    payload: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Quote> {
    const quote = await this.port.update(id, payload);
    return QuoteSchema.parse(quote);
  }
}