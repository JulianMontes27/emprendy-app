// src/lib/db/repositories/invoice.repository.ts
import { invoices } from "@/db/schema";
import { BaseRepository } from "./base.repository";
import { and, eq } from "drizzle-orm";

export type Invoice = typeof invoices.$inferSelect; // TypeScript type for the invoice

export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor() {
    super(invoices);
  }

  async findWithDetails(id: string, businessId: string) {
    await this.validateBusinessAccess(businessId);

    return await this.db.query.invoices.findFirst({
      where: and(eq(invoices.id, id), eq(invoices.businessId, businessId)),
      with: {
        customer: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    });
  }

  // Custom invoice-specific methods here
}
