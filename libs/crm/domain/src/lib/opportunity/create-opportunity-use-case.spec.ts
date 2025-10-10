import {
  CustomerBuilder,
  Opportunity,
  OpportunityBuilder,
} from '@eak-shop/crm-models';
import { CreateOpportunityUseCase } from './create-opportunity-use-case';
import { FakeOpportunityAdapter } from './fake-opportunity-adapter';
import { afterEach, beforeEach } from 'vitest';

describe('CreateOpportunityUseCase', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValueOnce(
      'f3b8a927-6e4c-4d1f-b2a5-3c9d8e7f1a64'
    );
  });

  afterEach(() => vi.useRealTimers());

  it('should create an opportunity', async () => {
    const port = new FakeOpportunityAdapter();
    const customer = CustomerBuilder.johnDoeFromAcme().build();
    const expected: Opportunity =
      OpportunityBuilder.withCustomer(customer).build();
    port.setOpportunity(expected);
    const useCase = new CreateOpportunityUseCase(port);
    const payload: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: customer.id,
      title: 'Deal',
      stage: 'new',
    };

    const opportunity = await useCase.execute(payload);

    expect(opportunity).toEqual<Opportunity>(expected);
  });
});
