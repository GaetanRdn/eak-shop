import { Customer, Opportunity } from '@eak-shop/crm-models';
import { OpportunityPort } from '@eak-shop/crm-domain';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export class HttpOpportunityAdapter implements OpportunityPort {
  private readonly httpClient = inject(HttpClient);

  async create(
    payload: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Opportunity> {
    const now = new Date();
    const opportunity: Opportunity = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    return firstValueFrom(
      this.httpClient.post<Opportunity>(`/opportunities`, opportunity)
    );
  }

  async getByCustomer(customerId: Customer['id']): Promise<Opportunity[]> {
    return firstValueFrom(
      this.httpClient.get<Opportunity[]>(
        `/opportunities?customerId=${customerId}`
      )
    );
  }
}
