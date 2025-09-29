import { Customer, CustomerSchema } from '@eak-shop/crm-models';
import { CustomerPort } from './customer-port';
import { z } from 'zod';

export class GetAllCustomersUseCase {
  constructor(private readonly port: CustomerPort) { }

  async execute(): Promise<Customer[]> {
    const customers = await this.port.getAll();
    return z.array(CustomerSchema).parse(customers);
  }
}