import { Opportunity, Quote } from '@eak-shop/crm-models';
import { QuotePort } from './quote-port';

export class FakeQuoteAdapter implements QuotePort {
  private quotes: Quote[] = [];

  async create(
    payload: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Quote> {
    const now = new Date();
    const quote: Quote = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.quotes.push(quote);
    return quote;
  }

  async update(
    id: Quote['id'],
    payload: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Quote> {
    const index = this.quotes.findIndex((quote) => quote.id === id);
    if (index === -1) {
      throw new Error(`Quote with id ${id} not found`);
    }

    const updatedQuote: Quote = {
      ...this.quotes[index],
      ...payload,
      updatedAt: new Date(),
    };
    this.quotes[index] = updatedQuote;
    return updatedQuote;
  }

  async getByOpportunity(
    opportunityId: Opportunity['id']
  ): Promise<Quote | undefined> {
    return this.quotes.find((quote) => quote.opportunityId === opportunityId);
  }

  setQuote(quote: Quote): void {
    this.quotes = [quote];
  }
}
