import { Opportunity, Quote } from '@eak-shop/crm-models';
import { QuotePort } from '@eak-shop/crm-domain';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { inject, Injectable } from '@angular/core';

@Injectable()
export class HttpQuoteAdapter implements QuotePort {
  private readonly httpClient = inject(HttpClient);

  async create(
    payload: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Quote> {
    const now = new Date();
    const quote: Quote = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    return firstValueFrom(this.httpClient.post<Quote>(`/quotes`, quote));
  }

  async update(
    id: Quote['id'],
    payload: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Quote> {
    return firstValueFrom(this.httpClient.put<Quote>(`/quotes/${id}`, payload));
  }

  async getByOpportunity(
    opportunityId: Opportunity['id']
  ): Promise<Quote | undefined> {
    return firstValueFrom(
      this.httpClient.get<Quote | undefined>(`/quotes/${opportunityId}`)
    );
  }
}
