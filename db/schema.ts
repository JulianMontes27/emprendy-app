import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  json,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { relations } from "drizzle-orm";

// Users Table (Admin/Marketing Users)
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  contacts: many(contacts),
  lists: many(lists),
  emailTemplates: many(emailTemplates),
  campaigns: many(campaigns),
  emailTracking: many(emailTracking),
  accounts: many(accounts), // Added for completeness
  sessions: many(sessions), // Added for completeness
}));

// Next Auth Tables
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
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);
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
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// Contacts Table (Prospects/Cold Email Recipients)
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  companyName: text("company_name"),
  jobTitle: text("job_title"),
  phone: text("phone"),
  linkedinUrl: text("linkedin_url"),
  website: text("website"),
  industry: text("industry"),
  companySize: text("company_size"),
  location: text("location"),
  source: text("source"),
  notes: text("notes"),
  tags: json("tags").default([]),
  customFields: json("custom_fields").default({}),
  isVerified: boolean("is_verified").default(false),
  status: text("status").default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
  contactsToLists: many(contactsToLists),
}));

// Lists (Segments of contacts)
export const lists = pgTable("lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const listsRelations = relations(lists, ({ many, one }) => ({
  createdBy: one(users, {
    fields: [lists.createdById],
    references: [users.id],
  }),
  contactsToLists: many(contactsToLists),
  campaignsToLists: many(campaignsToLists), // Added for completeness
}));

export const contactsToLists = pgTable(
  "contacts_to_lists",
  {
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    listId: uuid("list_id")
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.contactId, t.listId] }),
  })
);

export const contactsToListsRelations = relations(
  contactsToLists,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [contactsToLists.contactId],
      references: [contacts.id],
    }),
    list: one(lists, {
      fields: [contactsToLists.listId],
      references: [lists.id],
    }),
  })
);

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  subject: text("subject"),
  content: text("content"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").default("html"),
  category: text("category").default("cold_email"),
  variables: json("variables").default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const emailTemplatesRelations = relations(
  emailTemplates,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [emailTemplates.createdById],
      references: [users.id],
    }),
    campaigns: many(campaigns),
  })
);

// Campaigns
export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  templateId: uuid("template_id")
    .notNull()
    .references(() => emailTemplates.id, { onDelete: "restrict" }),
  status: text("status").default("borrador"),
  sendFromEmail: text("send_from_email").notNull(),
  sendFromName: text("send_from_name").notNull(),
  replyToEmail: text("reply_to_email"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  trackOpens: boolean("track_opens").default(true),
  trackClicks: boolean("track_clicks").default(true),
  settings: json("settings").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [campaigns.createdById],
    references: [users.id],
  }),
  template: one(emailTemplates, {
    fields: [campaigns.templateId],
    references: [emailTemplates.id],
  }),
  campaignsToLists: many(campaignsToLists),
  emailQueue: many(emailQueue),
  emailTracking: many(emailTracking), // Added relationship
}));

export const campaignsToLists = pgTable(
  "campaigns_to_lists",
  {
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    listId: uuid("list_id")
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.campaignId, t.listId] }),
  })
);

export const campaignsToListsRelations = relations(
  campaignsToLists,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [campaignsToLists.campaignId],
      references: [campaigns.id],
    }),
    list: one(lists, {
      fields: [campaignsToLists.listId],
      references: [lists.id],
    }),
  })
);

// Email Tracking
export const emailTracking = pgTable("email_tracking", {
  id: text("id").primaryKey(), // Changed to text to match nanoid()
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id") // Changed to uuid to match campaigns.id
    .references(() => campaigns.id, { onDelete: "set null" }), // Made nullable
  recipients: text("recipients").notNull(),
  subject: text("subject").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow(),
  status: text("status").default("sent"),
});

export const emailTrackingRelations = relations(
  emailTracking,
  ({ one, many }) => ({
    user: one(users, {
      fields: [emailTracking.userId],
      references: [users.id],
    }),
    campaign: one(campaigns, {
      // Added campaign relationship
      fields: [emailTracking.campaignId],
      references: [campaigns.id],
    }),
    opens: many(emailOpens),
    clicks: many(emailClicks),
  })
);

// Email Opens
export const emailOpens = pgTable(
  "email_opens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailId: text("email_id") // Changed to text to match emailTracking.id
      .notNull()
      .references(() => emailTracking.id, { onDelete: "cascade" }),
    recipient: text("recipient").notNull(),
    openedAt: timestamp("opened_at", { withTimezone: true }).defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    location: text("location"),
    device: text("device"),
  },
  // The uniqueEmailRecipient constraint ensures only one row can exist per emailId-recipient pair. If you try to insert a duplicate, the database will throw an error unless you handle it with an upsert.
  (table) => ({
    uniqueEmailRecipient: unique("unique_email_recipient").on(
      table.emailId,
      table.recipient
    ),
  })
);

export const emailOpensRelations = relations(emailOpens, ({ one }) => ({
  email: one(emailTracking, {
    fields: [emailOpens.emailId],
    references: [emailTracking.id],
  }),
}));

// Email Clicks
export const emailClicks = pgTable("email_clicks", {
  id: uuid("id").defaultRandom().primaryKey(),
  emailId: text("email_id") // Changed to text to match emailTracking.id
    .notNull()
    .references(() => emailTracking.id, { onDelete: "cascade" }),
  recipient: text("recipient").notNull(),
  url: text("url").notNull(),
  clickedAt: timestamp("clicked_at", { withTimezone: true }).defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"),
  device: text("device"),
});

export const emailClicksRelations = relations(emailClicks, ({ one }) => ({
  email: one(emailTracking, {
    fields: [emailClicks.emailId],
    references: [emailTracking.id],
  }),
}));

// Email Queue
export const emailQueue = pgTable("email_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  status: text("status").default("queued"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const emailQueueRelations = relations(emailQueue, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [emailQueue.campaignId],
    references: [campaigns.id],
  }),
}));
