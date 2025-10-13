import { Customer } from '@eak-shop/crm-models';
import { CustomerPort } from '@eak-shop/crm-domain';
import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export class HttpCustomerAdapter implements CustomerPort {
  private readonly httpClient = inject(HttpClient);

  create(payload: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    return firstValueFrom(
      this.httpClient.post<Customer>(`/customers`, payload)
    );
  }

  getAll(): Promise<Customer[]> {
    return firstValueFrom(this.httpClient.get<Customer[]>(`/customers`));
  }
}
