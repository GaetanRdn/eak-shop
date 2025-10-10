import { Customer } from './customer';
import { Opportunity } from './opportunity';

export class OpportunityBuilder {
  private entity: Opportunity = {
    id: 'f3b8a927-6e4c-4d1f-b2a5-3c9d8e7f1a64',
    customerId: '29604712-5d3d-4ddf-8766-febf12151321',
    title: 'Deal',
    stage: 'new',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  };

  private constructor() {
    /* empty */
  }

  static withCustomer(customer: Customer): OpportunityBuilder {
    const builder = new OpportunityBuilder();
    builder.entity = {
      ...builder.entity,
      customerId: customer.id,
    };
    return builder;
  }

  build(): Opportunity {
    return { ...this.entity };
  }
}
