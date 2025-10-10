import { Customer, CustomerBuilder, Opportunity, OpportunityBuilder } from '@eak-shop/crm-models';
import { GetOpportunityByCustomerUseCase } from './get-opportunity-by-customer-use-case';
import { FakeOpportunityAdapter } from './fake-opportunity-adapter';

describe('GetOpportunityByCustomerUseCase', () => {
  it('should return opportunities for a customer', async () => {
    const port: FakeOpportunityAdapter = new FakeOpportunityAdapter();
    const customer: Customer = CustomerBuilder.johnDoeFromAcme().build();
    const opportunity: Opportunity = OpportunityBuilder.withCustomer(customer).build();
    
    port.setOpportunities([opportunity]);

    const useCase = new GetOpportunityByCustomerUseCase(port);
    const opportunities = await useCase.execute(customer.id);

    expect(opportunities).toHaveLength(1);
    expect(opportunities[0]).toEqual(opportunity);
  });

  it('should return empty array when no opportunities exist for customer', async () => {
    const port: FakeOpportunityAdapter = new FakeOpportunityAdapter();
    const useCase = new GetOpportunityByCustomerUseCase(port);
    
    const opportunities = await useCase.execute('non-existing-customer-id');

    expect(opportunities).toHaveLength(0);
  });
});
