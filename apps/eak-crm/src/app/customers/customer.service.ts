import { Injectable, computed, signal, inject } from '@angular/core';
import { Customer, CustomerCreate, CustomerUpdate } from './customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly STORAGE_KEY = 'eak-crm-customers';
  
  private readonly customers = signal<Customer[]>(this.loadFromStorage());
  
  readonly allCustomers = computed(() => this.customers());
  
  readonly customersCount = computed(() => this.customers().length);
  
  constructor() {
    this.initializeWithSampleData();
  }
  
  private loadFromStorage(): Customer[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  private saveToStorage(customers: Customer[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customers));
  }
  
  private initializeWithSampleData(): void {
    if (this.customers().length === 0) {
      const sampleCustomers: Customer[] = [
        {
          id: this.generateId(),
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          phone: '01 23 45 67 89',
          company: 'Dupont SARL',
          address: '123 rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: this.generateId(),
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@example.com',
          phone: '01 98 76 54 32',
          company: 'Martin & Co',
          address: '456 avenue des Champs',
          city: 'Lyon',
          postalCode: '69000',
          country: 'France',
          createdAt: new Date('2024-02-20'),
          updatedAt: new Date('2024-02-20')
        },
        {
          id: this.generateId(),
          firstName: 'Pierre',
          lastName: 'Bernard',
          email: 'p.bernard@example.com',
          phone: '02 34 56 78 90',
          company: 'Bernard Industries',
          address: '789 boulevard Victor Hugo',
          city: 'Marseille',
          postalCode: '13000',
          country: 'France',
          createdAt: new Date('2024-03-10'),
          updatedAt: new Date('2024-03-10')
        }
      ];
      this.customers.set(sampleCustomers);
      this.saveToStorage(sampleCustomers);
    }
  }
  
  private generateId(): string {
    return `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getCustomerById(id: string): Customer | undefined {
    return this.customers().find(c => c.id === id);
  }
  
  searchCustomers(query: string): Customer[] {
    const lowerQuery = query.toLowerCase();
    return this.customers().filter(c => 
      c.firstName.toLowerCase().includes(lowerQuery) ||
      c.lastName.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery) ||
      (c.company && c.company.toLowerCase().includes(lowerQuery))
    );
  }
  
  createCustomer(data: CustomerCreate): Customer {
    const newCustomer: Customer = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updated = [...this.customers(), newCustomer];
    this.customers.set(updated);
    this.saveToStorage(updated);
    
    return newCustomer;
  }
  
  updateCustomer(id: string, data: CustomerUpdate): Customer | null {
    const index = this.customers().findIndex(c => c.id === id);
    if (index === -1) return null;
    
    const updated = [...this.customers()];
    updated[index] = {
      ...updated[index],
      ...data,
      updatedAt: new Date()
    };
    
    this.customers.set(updated);
    this.saveToStorage(updated);
    
    return updated[index];
  }
  
  deleteCustomer(id: string): boolean {
    const filtered = this.customers().filter(c => c.id !== id);
    if (filtered.length === this.customers().length) return false;
    
    this.customers.set(filtered);
    this.saveToStorage(filtered);
    return true;
  }
}