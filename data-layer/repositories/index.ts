import { InvoiceRepository } from "./invoice.repository";

// src/lib/db/repositories/index.ts
export const repositories = {
  invoices: new InvoiceRepository(),
  // products: new ProductRepository(),
  // customers: new CustomerRepository(),
  // businesses: new BusinessRepository(),
} as const;
