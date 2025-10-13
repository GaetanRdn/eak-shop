import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'customers',
    pathMatch: 'full'
  },
  {
    path: 'customers',
    loadComponent: () => 
      import('./customers/customer-list.component').then(m => m.CustomerListComponent),
    title: 'Clients - EAK CRM'
  },
  {
    path: 'customers/new',
    loadComponent: () => 
      import('./customers/customer-form.component').then(m => m.CustomerFormComponent),
    title: 'Nouveau client - EAK CRM'
  },
  {
    path: 'customers/:id/edit',
    loadComponent: () => 
      import('./customers/customer-form.component').then(m => m.CustomerFormComponent),
    title: 'Modifier client - EAK CRM'
  },
  {
    path: 'quotes',
    loadComponent: () => 
      import('./quotes/quote-list.component').then(m => m.QuoteListComponent),
    title: 'Devis - EAK CRM'
  },
  {
    path: 'quotes/new',
    loadComponent: () => 
      import('./quotes/quote-form.component').then(m => m.QuoteFormComponent),
    title: 'Nouveau devis - EAK CRM'
  },
  {
    path: 'quotes/:id/edit',
    loadComponent: () => 
      import('./quotes/quote-form.component').then(m => m.QuoteFormComponent),
    title: 'Modifier devis - EAK CRM'
  }
];
