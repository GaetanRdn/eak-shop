import { CustomerPort } from './customer-port';
import { Customer } from '@eak-shop/crm-models';

export class FakeCustomerAdapter implements CustomerPort {
  customer: Customer | undefined;
  customers: Customer[] = [];

  setCustomer(customer: Customer) {
    this.customer = customer;
  }

  create(_: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    if (!this.customer) throw new Error('Customer not found');
    return Promise.resolve({ ...this.customer });
  }

  getAll(): Promise<Customer[]> {
    return Promise.resolve([...this.customers]);
  }

  setCustomers(...customers: Customer[]): void {
    this.customers = [];
    this.customers.push(...customers);
  }
}
