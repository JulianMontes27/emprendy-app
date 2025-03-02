import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import getSession from "@/lib/get-session";
import { businesses } from "@/db/schema";

// /data-layer/repositories/base.repository.ts
export class BaseRepository<T extends { id: string; businessId: string }> {
  constructor(protected table: any, protected db: any = db) {}

  protected async validateBusinessAccess(businessId: string) {
    const session = await getSession();
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
      columns: { userId: true },
    });

    if (!business || business.userId !== session?.user?.id) {
      throw new Error("Unauthorized access to business");
    }
  }

  async findById(id: string, businessId: string) {
    await this.validateBusinessAccess(businessId);

    return await this.db.query[this.table].findFirst({
      where: and(eq(this.table.id, id), eq(this.table.businessId, businessId)),
    });
  }

  async findMany(businessId: string, options = {}) {
    await this.validateBusinessAccess(businessId);

    return await this.db.query[this.table].findMany({
      where: eq(this.table.businessId, businessId),
      ...options,
    });
  }

  async create(data: Partial<T>) {
    await this.validateBusinessAccess(data.businessId!);

    return await this.db.insert(this.table).values(data).returning();
  }

  async update(id: string, businessId: string, data: Partial<T>) {
    await this.validateBusinessAccess(businessId);

    return await this.db
      .update(this.table)
      .set(data)
      .where(and(eq(this.table.id, id), eq(this.table.businessId, businessId)))
      .returning();
  }

  async delete(id: string, businessId: string) {
    await this.validateBusinessAccess(businessId);

    return await this.db
      .delete(this.table)
      .where(and(eq(this.table.id, id), eq(this.table.businessId, businessId)))
      .returning();
  }
}
