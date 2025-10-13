import { computed, inject, Injectable, signal } from '@angular/core';
import { Quote, QuoteLine } from './quote.model';
import { CustomerService } from '../customers/customer.service';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  private readonly STORAGE_KEY = 'eak-crm-quotes';
  private readonly customerService = inject(CustomerService);

  private readonly quotes = signal<Quote[]>(this.loadFromStorage());

  readonly allQuotes = computed(() => this.quotes());

  private readonly quoteCounter = signal(this.getInitialCounter());

  constructor() {
    this.initializeWithSampleData();
  }

  createQuote(data: Partial<Quote>): Quote {
    const lines = data.lines || [];
    const discountPercent = data.discountPercent || 0;
    const taxRate = data.taxRate || 20;

    const totals = this.calculateQuoteTotals(lines, discountPercent, taxRate);

    const newQuote: Quote = {
      id: this.generateId(),
      customerId: data.customerId || '',
      customerName: data.customerName,
      quoteNumber: this.generateQuoteNumber(),
      date: data.date || new Date(),
      validUntil:
        data.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: data.status || 'draft',
      lines: lines,
      discountPercent,
      taxRate,
      notes: data.notes || '',
      ...totals,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = [...this.quotes(), newQuote];
    this.quotes.set(updated);
    this.saveToStorage(updated);

    return newQuote;
  }

  updateQuote(id: string, data: Partial<Quote>): Quote | null {
    const index = this.quotes().findIndex((q) => q.id === id);
    if (index === -1) return null;

    const current = this.quotes()[index];
    const lines = data.lines || current.lines;
    const discountPercent = data.discountPercent ?? current.discountPercent;
    const taxRate = data.taxRate ?? current.taxRate;

    const totals = this.calculateQuoteTotals(lines, discountPercent, taxRate);

    const updated = [...this.quotes()];
    updated[index] = {
      ...current,
      ...data,
      lines,
      discountPercent,
      taxRate,
      ...totals,
      updatedAt: new Date(),
    };

    this.quotes.set(updated);
    this.saveToStorage(updated);

    return updated[index];
  }

  deleteQuote(id: string): boolean {
    const filtered = this.quotes().filter((q) => q.id !== id);
    if (filtered.length === this.quotes().length) return false;

    this.quotes.set(filtered);
    this.saveToStorage(filtered);
    return true;
  }

  getQuoteById(id: string): Quote | undefined {
    return this.quotes().find((q) => q.id === id);
  }

  private loadFromStorage(): Quote[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored
        ? JSON.parse(stored, (key, value) => {
            if (
              key === 'date' ||
              key === 'validUntil' ||
              key === 'createdAt' ||
              key === 'updatedAt'
            ) {
              return new Date(value);
            }
            return value;
          })
        : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(quotes: Quote[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quotes));
  }

  private getInitialCounter(): number {
    const stored = localStorage.getItem('eak-crm-quote-counter');
    return stored ? parseInt(stored, 10) : 1;
  }

  private saveCounter(value: number): void {
    localStorage.setItem('eak-crm-quote-counter', value.toString());
  }

  private generateQuoteNumber(): string {
    const counter = this.quoteCounter();
    const year = new Date().getFullYear();
    const number = `DEVIS-${year}-${counter.toString().padStart(4, '0')}`;
    this.quoteCounter.set(counter + 1);
    this.saveCounter(counter + 1);
    return number;
  }

  private initializeWithSampleData(): void {
    if (this.quotes().length === 0) {
      const customers = this.customerService.allCustomers();
      if (customers.length > 0) {
        const sampleQuotes: Quote[] = [
          this.createQuote({
            customerId: customers[0].id,
            customerName: `${customers[0].firstName} ${customers[0].lastName}`,
            date: new Date('2024-12-01'),
            validUntil: new Date('2024-12-31'),
            status: 'sent',
            lines: [
              {
                id: this.generateLineId(),
                description: 'Développement application web',
                quantity: 40,
                unitPrice: 500,
                total: 20000,
              },
              {
                id: this.generateLineId(),
                description: 'Formation équipe',
                quantity: 8,
                unitPrice: 800,
                total: 6400,
              },
            ],
            discountPercent: 10,
            taxRate: 20,
            notes: 'Paiement à 30 jours',
          }),
          this.createQuote({
            customerId: customers[1]?.id || customers[0].id,
            customerName: customers[1]
              ? `${customers[1].firstName} ${customers[1].lastName}`
              : `${customers[0].firstName} ${customers[0].lastName}`,
            date: new Date('2024-12-15'),
            validUntil: new Date('2025-01-15'),
            status: 'draft',
            lines: [
              {
                id: this.generateLineId(),
                description: 'Audit sécurité',
                quantity: 5,
                unitPrice: 1200,
                total: 6000,
              },
            ],
            discountPercent: 0,
            taxRate: 20,
            notes: '',
          }),
        ];

        this.quotes.set(sampleQuotes);
        this.saveToStorage(sampleQuotes);
      }
    }
  }

  private generateId(): string {
    return `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLineId(): string {
    return `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateQuoteTotals(
    lines: QuoteLine[],
    discountPercent: number,
    taxRate: number
  ): {
    subtotal: number;
    discountAmount: number;
    totalBeforeTax: number;
    taxAmount: number;
    totalAmount: number;
  } {
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const totalBeforeTax = subtotal - discountAmount;
    const taxAmount = totalBeforeTax * (taxRate / 100);
    const totalAmount = totalBeforeTax + taxAmount;

    return {
      subtotal,
      discountAmount,
      totalBeforeTax,
      taxAmount,
      totalAmount,
    };
  }
}
