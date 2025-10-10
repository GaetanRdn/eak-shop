import { UpdateQuoteUseCase } from './update-quote-use-case';
import { FakeQuoteAdapter } from './fake-quote-adapter';

describe('UpdateQuoteUseCase', () => {
  it('should update a quote', async () => {
    const port: FakeQuoteAdapter = new FakeQuoteAdapter();

    const createdQuote = await port.create({
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
    });

    const useCase = new UpdateQuoteUseCase(port);

    const updatedLines = [
      {
        refArticle: 'ART002',
        label: 'Service premium',
        unitPrice: 750,
        quantity: 2,
      },
    ];

    const updatedQuote = await useCase.execute(createdQuote.id, {
      lines: updatedLines,
      discountRate: 0.1,
    });

    expect(updatedQuote.lines).toEqual(updatedLines);
    expect(updatedQuote.discountRate).toBe(0.1);
    expect(updatedQuote.vatRate).toBe(0.2);
    expect(updatedQuote.id).toBe(createdQuote.id);
  });
});
