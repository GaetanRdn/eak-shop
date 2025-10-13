export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerCreate = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type CustomerUpdate = Partial<CustomerCreate>;
