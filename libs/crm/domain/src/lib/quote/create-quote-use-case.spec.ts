import { Quote, QuoteBuilder } from '@eak-shop/crm-models';
import { CreateQuoteUseCase } from './create-quote-use-case';
import { FakeQuoteAdapter } from './fake-quote-adapter';

describe('CreateQuoteUseCase', () => {
  it('should create a quote', async () => {
    const port: FakeQuoteAdapter = new FakeQuoteAdapter();
    const useCase = new CreateQuoteUseCase(port);

    const payload = {
      opportunityId: 'f3b8a927-6e4c-4d1f-b2a5-3c9d8e7f1a64',
      lines: [
        {
          refArticle: 'ART001',
          label: 'Service de consultation',
          unitPrice: 500,
          quantity: 1,
        },
      ],
      discountRate: 0,
      vatRate: 0.2,
    };

    const quote = await useCase.execute(payload);

    expect(quote.opportunityId).toBe(payload.opportunityId);
    expect(quote.lines).toEqual(payload.lines);
    expect(quote.discountRate).toBe(payload.discountRate);
    expect(quote.vatRate).toBe(payload.vatRate);
    expect(quote.id).toBeDefined();
    expect(quote.createdAt).toBeInstanceOf(Date);
    expect(quote.updatedAt).toBeInstanceOf(Date);
  });
});