import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  varchar,
  decimal,
  json,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { relations, sql } from "drizzle-orm";

// Users Table
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),

  role: text("role").notNull().default("user"),

  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),

  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// Accounts Table
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

// Sessions Table
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

// Memberships Table (Defines membership plans)
export const memberships = pgTable("memberships", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text("name").notNull(), // e.g., Junior, Platino, Plata
  price: decimal("price", { precision: 12, scale: 2 }).notNull(), // Monthly price
  ages: text("ages").notNull(), // e.g., 5-10, 11-20, 21+
  services: json("services").notNull(), // Array of services (e.g., ["3 clases de tenis", "1 Masaje"])
  plus: json("plus").notNull(), // Array of additional benefits (e.g., ["Tarro de bolas", "Bebida energética"])
  paymentLink: text("payment_link").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Subscriptions Table (Tracks user subscriptions to memberships)
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  membershipId: uuid("membershipId")
    .notNull()
    .references(() => memberships.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"), // e.g., active, canceled, paused
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Payments Table (Tracks payment records for subscriptions)
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  subscriptionId: uuid("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),
  paymentGateway: text("payment_gateway").notNull(),
  paymentId: text("payment_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Invoices Table (Tracks invoices for payments)
export const invoices = pgTable("invoices", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  paymentId: uuid("paymentId")
    .notNull()
    .references(() => payments.id, { onDelete: "cascade" }),
  number: varchar("number", { length: 50 }).notNull().unique(),
  issueDate: timestamp("issue_date", { withTimezone: true }).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // e.g., draft, issued, paid
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const membershipsRelations = relations(memberships, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [subscriptions.userId],
      references: [users.id],
    }),
    membership: one(memberships, {
      fields: [subscriptions.membershipId],
      references: [memberships.id],
    }),
    payments: many(payments),
  })
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
  invoice: one(invoices, {
    fields: [payments.id],
    references: [invoices.paymentId],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  payment: one(payments, {
    fields: [invoices.paymentId],
    references: [payments.id],
  }),
}));