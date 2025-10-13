import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from './customer.service';
import { Customer } from './customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="customer-list">
      <header class="list-header">
        <h1>Clients</h1>
        <button class="btn-primary" (click)="navigateToCreate()">
          + Nouveau client
        </button>
      </header>

      <div class="search-bar">
        <input 
          type="search" 
          class="search-input"
          placeholder="Rechercher un client..."
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange()"
        >
        <span class="search-count">{{ filteredCustomers().length }} résultat(s)</span>
      </div>

      @if (filteredCustomers().length === 0) {
        <div class="empty-state">
          @if (searchQuery()) {
            <p>Aucun client trouvé pour "{{ searchQuery() }}"</p>
          } @else {
            <p>Aucun client enregistré</p>
            <button class="btn-primary" (click)="navigateToCreate()">
              Créer le premier client
            </button>
          }
        </div>
      } @else {
        <div class="customer-grid">
          <table class="data-table">
            <thead>
              <tr>
                <th (click)="sortBy('lastName')" class="sortable">
                  Nom 
                  @if (sortField() === 'lastName') {
                    <span>{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                  }
                </th>
                <th (click)="sortBy('firstName')" class="sortable">
                  Prénom
                  @if (sortField() === 'firstName') {
                    <span>{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                  }
                </th>
                <th>Email</th>
                <th>Société</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (customer of sortedCustomers(); track customer.id) {
                <tr>
                  <td>{{ customer.lastName }}</td>
                  <td>{{ customer.firstName }}</td>
                  <td>
                    <a href="mailto:{{ customer.email }}">{{ customer.email }}</a>
                  </td>
                  <td>{{ customer.company || '-' }}</td>
                  <td>{{ customer.phone || '-' }}</td>
                  <td class="actions">
                    <button 
                      class="btn-icon" 
                      title="Voir les devis"
                      (click)="viewQuotes(customer)"
                    >
                      📄
                    </button>
                    <button 
                      class="btn-icon" 
                      title="Modifier"
                      (click)="editCustomer(customer)"
                    >
                      ✏️
                    </button>
                    <button 
                      class="btn-icon btn-danger" 
                      title="Supprimer"
                      (click)="deleteCustomer(customer)"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .customer-list {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .list-header h1 {
      margin: 0;
      font-size: 1.8rem;
      color: #333;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .search-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    .search-count {
      color: #666;
      font-size: 0.9rem;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-state p {
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }

    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
    }

    .data-table th.sortable:hover {
      background: #e9ecef;
    }

    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }

    .data-table tr:hover {
      background: #f8f9fa;
    }

    .data-table a {
      color: #007bff;
      text-decoration: none;
    }

    .data-table a:hover {
      text-decoration: underline;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      padding: 0.5rem;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #e9ecef;
      transform: translateY(-2px);
    }

    .btn-icon.btn-danger:hover {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }
  `]
})
export class CustomerListComponent {
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);

  searchQuery = signal('');
  sortField = signal<keyof Customer | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  filteredCustomers = computed(() => {
    const query = this.searchQuery();
    if (!query) {
      return this.customerService.allCustomers();
    }
    return this.customerService.searchCustomers(query);
  });

  sortedCustomers = computed(() => {
    const customers = [...this.filteredCustomers()];
    const field = this.sortField();
    const direction = this.sortDirection();

    if (!field) return customers;

    return customers.sort((a, b) => {
      const aVal = a[field] ?? '';
      const bVal = b[field] ?? '';
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  });

  onSearchChange(): void {
    this.sortField.set(null);
  }

  sortBy(field: keyof Customer): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/customers/new']);
  }

  viewQuotes(customer: Customer): void {
    this.router.navigate(['/quotes'], { queryParams: { customerId: customer.id } });
  }

  editCustomer(customer: Customer): void {
    this.router.navigate(['/customers', customer.id, 'edit']);
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${customer.firstName} ${customer.lastName} ?`)) {
      this.customerService.deleteCustomer(customer.id);
    }
  }
}