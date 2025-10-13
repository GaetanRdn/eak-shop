import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from './customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="customer-form">
      <header class="form-header">
        <h1>{{ isEditMode() ? 'Modifier le client' : 'Nouveau client' }}</h1>
      </header>

      <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <div class="form-group">
            <label for="firstName">Prénom *</label>
            <input
              id="firstName"
              type="text"
              formControlName="firstName"
              [class.error]="isFieldInvalid('firstName')"
            />
            @if (isFieldInvalid('firstName')) {
            <span class="error-message">Le prénom est requis</span>
            }
          </div>

          <div class="form-group">
            <label for="lastName">Nom *</label>
            <input
              id="lastName"
              type="text"
              formControlName="lastName"
              [class.error]="isFieldInvalid('lastName')"
            />
            @if (isFieldInvalid('lastName')) {
            <span class="error-message">Le nom est requis</span>
            }
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              [class.error]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
            <span class="error-message">
              @if (customerForm.get('email')?.hasError('required')) { L'email
              est requis } @else if
              (customerForm.get('email')?.hasError('email')) { Format d'email
              invalide }
            </span>
            }
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input id="phone" type="tel" formControlName="phone" />
          </div>

          <div class="form-group full-width">
            <label for="company">Société</label>
            <input id="company" type="text" formControlName="company" />
          </div>

          <div class="form-group full-width">
            <label for="address">Adresse</label>
            <input id="address" type="text" formControlName="address" />
          </div>

          <div class="form-group">
            <label for="city">Ville</label>
            <input id="city" type="text" formControlName="city" />
          </div>

          <div class="form-group">
            <label for="postalCode">Code postal</label>
            <input id="postalCode" type="text" formControlName="postalCode" />
          </div>

          <div class="form-group">
            <label for="country">Pays</label>
            <input
              id="country"
              type="text"
              formControlName="country"
              placeholder="France"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="cancel()">
            Annuler
          </button>
          <button
            type="submit"
            class="btn-primary"
            [disabled]="!customerForm.valid || isSubmitting()"
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
        max-width: 800px;
        margin: 0 auto;
      }

      .customer-form {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 2rem;
      }

      .form-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f0f0f0;
      }

      .form-header h1 {
        margin: 0;
        font-size: 1.8rem;
        color: #333;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
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

      .form-group input {
        padding: 0.75rem;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .form-group input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }

      .form-group input.error {
        border-color: #dc3545;
      }

      .form-group input.error:focus {
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
      }

      .error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
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
    `,
  ],
})
export class CustomerFormComponent implements OnInit {
  isEditMode = signal(false);

  customerId = signal<string | null>(null);

  isSubmitting = signal(false);

  private readonly fb = inject(FormBuilder);

  customerForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    company: [''],
    address: [''],
    city: [''],
    postalCode: [''],
    country: ['France'],
  });

  private readonly customerService = inject(CustomerService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.customerId.set(id);
      this.isEditMode.set(true);
      this.loadCustomer(id);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.customerForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const formValue = this.customerForm.value;

      if (this.isEditMode() && this.customerId()) {
        this.customerService.updateCustomer(this.customerId()!, formValue);
      } else {
        this.customerService.createCustomer(formValue);
      }

      setTimeout(() => {
        this.router.navigate(['/customers']);
      }, 100);
    } else {
      Object.keys(this.customerForm.controls).forEach((key) => {
        const control = this.customerForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }

  private loadCustomer(id: string): void {
    const customer = this.customerService.getCustomerById(id);
    if (customer) {
      this.customerForm.patchValue({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone || '',
        company: customer.company || '',
        address: customer.address || '',
        city: customer.city || '',
        postalCode: customer.postalCode || '',
        country: customer.country || 'France',
      });
    } else {
      this.router.navigate(['/customers']);
    }
  }
}
