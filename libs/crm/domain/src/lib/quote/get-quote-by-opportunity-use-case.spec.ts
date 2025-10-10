import { Quote, QuoteBuilder } from '@eak-shop/crm-models';
import { GetQuoteByOpportunityUseCase } from './get-quote-by-opportunity-use-case';
import { FakeQuoteAdapter } from './fake-quote-adapter';

describe('GetQuoteByOpportunityUseCase', () => {
  it('should return quote for existing opportunity', async () => {
    const port: FakeQuoteAdapter = new FakeQuoteAdapter();
    const expectedQuote: Quote = QuoteBuilder.withOpportunity({
      id: 'f3b8a927-6e4c-4d1f-b2a5-3c9d8e7f1a64',
    }).build();

    port.setQuote(expectedQuote);

    const useCase = new GetQuoteByOpportunityUseCase(port);
    const quote = await useCase.execute(expectedQuote.opportunityId);

    expect(quote).toEqual<Quote>(expectedQuote);
  });

  it('should return undefined when no quote exists for opportunity', async () => {
    const port: FakeQuoteAdapter = new FakeQuoteAdapter();
    const useCase = new GetQuoteByOpportunityUseCase(port);

    const quote = await useCase.execute('non-existing-opportunity-id');

    expect(quote).toBeUndefined();
  });
});
