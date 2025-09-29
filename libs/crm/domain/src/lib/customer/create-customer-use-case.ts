import { Customer, CustomerSchema } from '@eak-shop/crm-models';
import { CustomerPort } from './customer-port';

export class CreateCustomerUseCase {
  constructor(private readonly port: CustomerPort) {}

  async execute(
    payload: Omit<Customer, 'id' | 'createdAt'>
  ): Promise<Customer> {
    const customer = await this.port.create(payload);
    return CustomerSchema.parse(customer);
  }
}