import { Customer } from '@eak-shop/crm-models';

export interface CustomerPort {
  create(payload: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer>

  getAll(): Promise<Customer[]>;
}