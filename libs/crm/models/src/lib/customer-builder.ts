import { Customer } from './customer';

export class CustomerBuilder {
  private customer: Customer = {
    id: '29604712-5d3d-4ddf-8766-febf12151321',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@yopmail.com',
    company: 'Acme',
    createdAt: new Date('2025-01-01T00:00:00Z'),
  };

  private constructor() { /* empty */ }

  static johnDoeFromAcme(): CustomerBuilder {
    return new CustomerBuilder();
  }

  static juliaDuckFromNetflix(): CustomerBuilder {
    const builder = new CustomerBuilder();
    builder.customer = {
      id: 'a7c45e89-2f8b-4c3d-9e1a-8f6b2d4c7e90',
      firstName: 'Julia',
      lastName: 'Duck',
      email: 'j.d@gmail.fr',
      company: 'Netflix',
      createdAt: new Date('2025-01-02T00:00:00Z'),
    };
    return builder;
  }

  build(): Customer {
    return { ...this.customer };
  }
}