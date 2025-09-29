import { describe } from 'vitest';
import { Customer, CustomerBuilder } from '@eak-shop/crm-models';
import { FakeCustomerAdapter } from './fake-customer-adapter';
import { GetAllCustomersUseCase } from './get-all-customers-use-case';

describe('GetAllCustomersUseCase', () => {
  it('should returns all customers', async () => {
    const port: FakeCustomerAdapter = new FakeCustomerAdapter();
    port.setCustomers(
      CustomerBuilder.johnDoeFromAcme().build(),
      CustomerBuilder.juliaDuckFromNetflix().build()
    );
    const useCase = new GetAllCustomersUseCase(port);

    const customers = await useCase.execute();

    expect(customers.length).toEqual(2);
    expect(customers[0]).toEqual<Customer>(
      CustomerBuilder.johnDoeFromAcme().build()
    );
    expect(customers[1]).toEqual<Customer>(
      CustomerBuilder.juliaDuckFromNetflix().build()
    );
  });
});
