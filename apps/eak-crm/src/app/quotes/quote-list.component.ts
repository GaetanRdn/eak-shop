import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuoteService } from './quote.service';
import { CustomerService } from '../customers/customer.service';
import { Quote } from './quote.model';

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="quote-list">
      <header class="list-header">
        <h1>Devis</h1>
        <button class="btn-primary" (click)="navigateToCreate()">
          + Nouveau devis
        </button>
      </header>

      <div class="filters">
        <select
          class="filter-select"
          [(ngModel)]="selectedCustomerId"
          (ngModelChange)="onFilterChange()"
        >
          <option value="">Tous les clients</option>
          @for (customer of customers(); track customer.id) {
          <option [value]="customer.id">
            {{ customer.firstName }} {{ customer.lastName }} @if
            (customer.company) { ({{ customer.company }}) }
          </option>
          }
        </select>

        <select
          class="filter-select"
          [(ngModel)]="selectedStatus"
          (ngModelChange)="onFilterChange()"
        >
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="sent">Envoyé</option>
          <option value="accepted">Accepté</option>
          <option value="rejected">Refusé</option>
          <option value="expired">Expiré</option>
        </select>

        <span class="filter-count">{{ filteredQuotes().length }} devis</span>
      </div>

      @if (filteredQuotes().length === 0) {
      <div class="empty-state">
        @if (selectedCustomerId() || selectedStatus()) {
        <p>Aucun devis trouvé avec ces critères</p>
        } @else {
        <p>Aucun devis enregistré</p>
        <button class="btn-primary" (click)="navigateToCreate()">
          Créer le premier devis
        </button>
        }
      </div>
      } @else {
      <div class="quote-grid">
        <table class="data-table">
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Client</th>
              <th>Date</th>
              <th>Validité</th>
              <th>Statut</th>
              <th class="text-right">Montant TTC</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (quote of sortedQuotes(); track quote.id) {
            <tr>
              <td class="quote-number">{{ quote.quoteNumber }}</td>
              <td>{{ quote.customerName || 'Client inconnu' }}</td>
              <td>{{ formatDate(quote.date) }}</td>
              <td>{{ formatDate(quote.validUntil) }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + quote.status">
                  {{ getStatusLabel(quote.status) }}
                </span>
              </td>
              <td class="text-right amount">
                {{ formatAmount(quote.totalAmount) }}
              </td>
              <td class="actions">
                <button
                  class="btn-icon"
                  title="Voir/Modifier"
                  (click)="editQuote(quote)"
                >
                  ✏️
                </button>
                <button
                  class="btn-icon"
                  title="Dupliquer"
                  (click)="duplicateQuote(quote)"
                >
                  📋
                </button>
                <button
                  class="btn-icon btn-danger"
                  title="Supprimer"
                  (click)="deleteQuote(quote)"
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
  styles: [
    `
      :host {
        display: block;
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .quote-list {
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

      .filters {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 2rem;
      }

      .filter-select {
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        background: white;
        cursor: pointer;
      }

      .filter-select:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }

      .filter-count {
        margin-left: auto;
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

      .data-table th.text-right,
      .data-table td.text-right {
        text-align: right;
      }

      .data-table td {
        padding: 1rem;
        border-bottom: 1px solid #dee2e6;
      }

      .data-table tr:hover {
        background: #f8f9fa;
      }

      .quote-number {
        font-weight: 500;
        color: #007bff;
      }

      .amount {
        font-weight: 600;
        font-size: 1.1rem;
      }

      .status-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .status-draft {
        background: #e9ecef;
        color: #495057;
      }

      .status-sent {
        background: #cfe2ff;
        color: #004085;
      }

      .status-accepted {
        background: #d1e7dd;
        color: #0a3622;
      }

      .status-rejected {
        background: #f8d7da;
        color: #721c24;
      }

      .status-expired {
        background: #fff3cd;
        color: #856404;
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
    `,
  ],
})
export class QuoteListComponent implements OnInit {
  selectedCustomerId = signal('');

  selectedStatus = signal('');

  sortedQuotes = computed(() => {
    return [...this.filteredQuotes()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  });

  private readonly quoteService = inject(QuoteService);

  filteredQuotes = computed(() => {
    let quotes = this.quoteService.allQuotes();

    const customerId = this.selectedCustomerId();
    if (customerId) {
      quotes = quotes.filter((q) => q.customerId === customerId);
    }

    const status = this.selectedStatus();
    if (status) {
      quotes = quotes.filter((q) => q.status === status);
    }

    return quotes;
  });

  private readonly customerService = inject(CustomerService);

  customers = computed(() => this.customerService.allCustomers());

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const customerId = this.route.snapshot.queryParamMap.get('customerId');
    if (customerId) {
      this.selectedCustomerId.set(customerId);
    }
  }

  onFilterChange(): void {
    // Triggers recomputation of filteredQuotes
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      rejected: 'Refusé',
      expired: 'Expiré',
    };
    return labels[status] || status;
  }

  navigateToCreate(): void {
    const customerId = this.selectedCustomerId();
    if (customerId) {
      this.router.navigate(['/quotes/new'], { queryParams: { customerId } });
    } else {
      this.router.navigate(['/quotes/new']);
    }
  }

  editQuote(quote: Quote): void {
    this.router.navigate(['/quotes', quote.id, 'edit']);
  }

  duplicateQuote(quote: Quote): void {
    const newQuote = this.quoteService.createQuote({
      ...quote,
      status: 'draft',
      date: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    this.router.navigate(['/quotes', newQuote.id, 'edit']);
  }

  deleteQuote(quote: Quote): void {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer le devis ${quote.quoteNumber} ?`
      )
    ) {
      this.quoteService.deleteQuote(quote.id);
    }
  }
}
