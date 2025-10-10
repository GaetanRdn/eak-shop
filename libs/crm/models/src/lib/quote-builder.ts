import { Opportunity } from './opportunity';
import { Quote } from './quote';

export class QuoteBuilder {
  private entity: Quote = {
    id: '8a7b5c3d-9e1f-4a2b-8c7d-5e9f1a3b6c8d',
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
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  };

  private constructor() {
    /* empty */
  }

  static withOpportunity(
    opportunity: Partial<Opportunity> & Pick<Opportunity, 'id'>
  ): QuoteBuilder {
    const builder = new QuoteBuilder();
    builder.entity = {
      ...builder.entity,
      opportunityId: opportunity.id,
    };
    return builder;
  }

  build(): Quote {
    return { ...this.entity };
  }
}
