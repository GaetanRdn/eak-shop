import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteService } from './quote.service';
import { CustomerService } from '../customers/customer.service';
import { QuoteLine } from './quote.model';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="quote-form">
      <header class="form-header">
        <h1>{{ isEditMode() ? 'Modifier le devis' : 'Nouveau devis' }}</h1>
        @if (quoteNumber()) {
        <span class="quote-number">{{ quoteNumber() }}</span>
        }
      </header>

      <form [formGroup]="quoteForm" (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h2>Informations générales</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="customerId">Client *</label>
              <select
                id="customerId"
                formControlName="customerId"
                [class.error]="isFieldInvalid('customerId')"
              >
                <option value="">Sélectionner un client</option>
                @for (customer of customers(); track customer.id) {
                <option [value]="customer.id">
                  {{ customer.firstName }} {{ customer.lastName }} @if
                  (customer.company) { ({{ customer.company }}) }
                </option>
                }
              </select>
              @if (isFieldInvalid('customerId')) {
              <span class="error-message">Le client est requis</span>
              }
            </div>

            <div class="form-group">
              <label for="date">Date *</label>
              <input
                id="date"
                type="date"
                formControlName="date"
                [class.error]="isFieldInvalid('date')"
              />
              @if (isFieldInvalid('date')) {
              <span class="error-message">La date est requise</span>
              }
            </div>

            <div class="form-group">
              <label for="validUntil">Valide jusqu'au *</label>
              <input
                id="validUntil"
                type="date"
                formControlName="validUntil"
                [class.error]="isFieldInvalid('validUntil')"
              />
              @if (isFieldInvalid('validUntil')) {
              <span class="error-message">La date de validité est requise</span>
              }
            </div>

            <div class="form-group">
              <label for="status">Statut</label>
              <select id="status" formControlName="status">
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Refusé</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h2>Lignes du devis</h2>
            <button
              type="button"
              class="btn-secondary btn-small"
              (click)="addLine()"
            >
              + Ajouter une ligne
            </button>
          </div>

          <div class="lines-table">
            <table>
              <thead>
                <tr>
                  <th style="width: 40%">Description</th>
                  <th style="width: 15%">Quantité</th>
                  <th style="width: 20%">Prix unitaire</th>
                  <th style="width: 20%">Total</th>
                  <th style="width: 5%"></th>
                </tr>
              </thead>
              <tbody formArrayName="lines">
                @for (line of linesArray.controls; track $index; let i = $index)
                {
                <tr [formGroupName]="i">
                  <td>
                    <input
                      type="text"
                      formControlName="description"
                      placeholder="Description"
                      class="full-width"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      formControlName="quantity"
                      min="0"
                      step="0.01"
                      (change)="updateLineTotal(i)"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      formControlName="unitPrice"
                      min="0"
                      step="0.01"
                      (change)="updateLineTotal(i)"
                    />
                  </td>
                  <td class="text-right">
                    {{ formatAmount(line.get('total')?.value || 0) }}
                  </td>
                  <td>
                    <button
                      type="button"
                      class="btn-icon btn-small"
                      title="Supprimer"
                      (click)="removeLine(i)"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
                }
              </tbody>
            </table>
            @if (linesArray.length === 0) {
            <div class="empty-lines">
              <p>Aucune ligne ajoutée</p>
              <button type="button" class="btn-secondary" (click)="addLine()">
                Ajouter la première ligne
              </button>
            </div>
            }
          </div>
        </div>

        <div class="form-section">
          <h2>Totaux</h2>
          <div class="totals-grid">
            <div class="form-group">
              <label for="discountPercent">Remise (%)</label>
              <input
                id="discountPercent"
                type="number"
                formControlName="discountPercent"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div class="form-group">
              <label for="taxRate">TVA (%)</label>
              <input
                id="taxRate"
                type="number"
                formControlName="taxRate"
                min="0"
                step="0.01"
              />
            </div>

            <div class="totals-summary">
              <div class="total-line">
                <span>Sous-total HT:</span>
                <span>{{ formatAmount(totals().subtotal) }}</span>
              </div>
              @if (totals().discountAmount > 0) {
              <div class="total-line">
                <span>Remise:</span>
                <span>-{{ formatAmount(totals().discountAmount) }}</span>
              </div>
              }
              <div class="total-line">
                <span>Total HT:</span>
                <span>{{ formatAmount(totals().totalBeforeTax) }}</span>
              </div>
              <div class="total-line">
                <span>TVA:</span>
                <span>{{ formatAmount(totals().taxAmount) }}</span>
              </div>
              <div class="total-line total-final">
                <span>Total TTC:</span>
                <span>{{ formatAmount(totals().totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="form-group full-width">
            <label for="notes">Notes</label>
            <textarea
              id="notes"
              formControlName="notes"
              rows="4"
              placeholder="Notes internes ou conditions particulières..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="cancel()">
            Annuler
          </button>
          <button
            type="submit"
            class="btn-primary"
            [disabled]="!quoteForm.valid || isSubmitting()"
          >
            {{
              isSubmitting()
                ? 'Enregistrement...'
                : isEditMode()
                ? 'Modifier'
                : 'Créer'
            }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 2rem;
        max-width: 1000px;
        margin: 0 auto;
      }

      .quote-form {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 2rem;
      }

      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f0f0f0;
      }

      .form-header h1 {
        margin: 0;
        font-size: 1.8rem;
        color: #333;
      }

      .quote-number {
        font-size: 1.2rem;
        color: #007bff;
        font-weight: 500;
      }

      .form-section {
        margin-bottom: 2.5rem;
      }

      .form-section h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.3rem;
        color: #495057;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group.full-width {
        grid-column: 1 / -1;
      }

      .form-group label {
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #495057;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        padding: 0.75rem;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }

      .form-group input.error,
      .form-group select.error {
        border-color: #dc3545;
      }

      .error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .lines-table {
        overflow-x: auto;
      }

      .lines-table table {
        width: 100%;
        border-collapse: collapse;
      }

      .lines-table th {
        background: #f8f9fa;
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
        color: #495057;
        border-bottom: 2px solid #dee2e6;
      }

      .lines-table td {
        padding: 0.5rem;
        border-bottom: 1px solid #dee2e6;
      }

      .lines-table input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ced4da;
        border-radius: 4px;
      }

      .lines-table input.full-width {
        width: 100%;
      }

      .empty-lines {
        text-align: center;
        padding: 2rem;
        background: #f8f9fa;
        border-radius: 4px;
        margin-top: 1rem;
      }

      .empty-lines p {
        margin-bottom: 1rem;
        color: #666;
      }

      .totals-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 2fr;
        gap: 2rem;
        align-items: start;
      }

      .totals-summary {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 4px;
      }

      .total-line {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #dee2e6;
      }

      .total-line:last-child {
        border-bottom: none;
      }

      .total-line.total-final {
        margin-top: 0.5rem;
        padding-top: 1rem;
        border-top: 2px solid #dee2e6;
        font-size: 1.2rem;
        font-weight: 600;
        color: #007bff;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 1.5rem;
        border-top: 1px solid #f0f0f0;
      }

      .btn-primary,
      .btn-secondary {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-small {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #0056b3;
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #5a6268;
      }

      .btn-icon {
        padding: 0.25rem 0.5rem;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 0.9rem;
      }

      .btn-icon:hover {
        opacity: 0.7;
      }

      .text-right {
        text-align: right;
      }
    `,
  ],
})
export class QuoteFormComponent implements OnInit {
  isEditMode = signal(false);

  quoteId = signal<string | null>(null);

  quoteNumber = signal<string | null>(null);

  isSubmitting = signal(false);

  private readonly fb = inject(FormBuilder);

  quoteForm: FormGroup = this.fb.group({
    customerId: ['', Validators.required],
    date: [this.formatDateForInput(new Date()), Validators.required],
    validUntil: [
      this.formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      Validators.required,
    ],
    status: ['draft'],
    lines: this.fb.array([]),
    discountPercent: [0],
    taxRate: [20],
    notes: [''],
  });

  totals = computed(() => {
    const lines = this.linesArray.value as QuoteLine[];
    const discountPercent = this.quoteForm.get('discountPercent')?.value || 0;
    const taxRate = this.quoteForm.get('taxRate')?.value || 0;

    const subtotal = lines.reduce((sum, line) => sum + (line.total || 0), 0);
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
  });

  private readonly quoteService = inject(QuoteService);

  private readonly customerService = inject(CustomerService);

  customers = computed(() => this.customerService.allCustomers());

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  get linesArray(): FormArray {
    return this.quoteForm.get('lines') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.quoteId.set(id);
      this.isEditMode.set(true);
      this.loadQuote(id);
    } else {
      const customerId = this.route.snapshot.queryParamMap.get('customerId');
      if (customerId) {
        this.quoteForm.patchValue({ customerId });
      }
      this.addLine(); // Add initial line for new quotes
    }
  }

  addLine(): void {
    this.linesArray.push(this.createLineFormGroup());
  }

  removeLine(index: number): void {
    this.linesArray.removeAt(index);
  }

  updateLineTotal(index: number): void {
    const line = this.linesArray.at(index);
    const quantity = line.get('quantity')?.value || 0;
    const unitPrice = line.get('unitPrice')?.value || 0;
    line.patchValue({ total: quantity * unitPrice });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  onSubmit(): void {
    if (this.quoteForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const formValue = this.quoteForm.value;
      const customerId = formValue.customerId;
      const customer = this.customerService.getCustomerById(customerId);

      const quoteData = {
        ...formValue,
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`
          : '',
        date: new Date(formValue.date),
        validUntil: new Date(formValue.validUntil),
      };

      if (this.isEditMode() && this.quoteId()) {
        this.quoteService.updateQuote(this.quoteId()!, quoteData);
      } else {
        this.quoteService.createQuote(quoteData);
      }

      setTimeout(() => {
        this.router.navigate(['/quotes']);
      }, 100);
    } else {
      Object.keys(this.quoteForm.controls).forEach((key) => {
        const control = this.quoteForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/quotes']);
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private loadQuote(id: string): void {
    const quote = this.quoteService.getQuoteById(id);
    if (quote) {
      this.quoteNumber.set(quote.quoteNumber);

      this.quoteForm.patchValue({
        customerId: quote.customerId,
        date: this.formatDateForInput(quote.date),
        validUntil: this.formatDateForInput(quote.validUntil),
        status: quote.status,
        discountPercent: quote.discountPercent,
        taxRate: quote.taxRate,
        notes: quote.notes || '',
      });

      // Load lines
      this.linesArray.clear();
      quote.lines.forEach((line) => {
        this.linesArray.push(this.createLineFormGroup(line));
      });
    } else {
      this.router.navigate(['/quotes']);
    }
  }

  private createLineFormGroup(line?: Partial<QuoteLine>): FormGroup {
    return this.fb.group({
      id: [line?.id || this.generateLineId()],
      description: [line?.description || '', Validators.required],
      quantity: [line?.quantity || 1, [Validators.required, Validators.min(0)]],
      unitPrice: [
        line?.unitPrice || 0,
        [Validators.required, Validators.min(0)],
      ],
      total: [line?.total || 0],
    });
  }

  private generateLineId(): string {
    return `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
