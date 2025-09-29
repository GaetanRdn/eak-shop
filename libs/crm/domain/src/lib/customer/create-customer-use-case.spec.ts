import { Customer, CustomerBuilder } from '@eak-shop/crm-models';
import { CreateCustomerUseCase } from './create-customer-use-case';
import { FakeCustomerAdapter } from './fake-customer-adapter';

describe('CreateCustomerUseCase', () => {
  it('should create a customer', async () => {
    const port: FakeCustomerAdapter = new FakeCustomerAdapter();
    const expected: Customer = CustomerBuilder.johnDoeFromAcme().build();
    port.setCustomer(expected);

    const useCase = new CreateCustomerUseCase(port);

    const { id, createdAt, ...payload } = expected;
    const customer = await useCase.execute(payload);

    expect(customer).toEqual<Customer>(expected);
  });
});
