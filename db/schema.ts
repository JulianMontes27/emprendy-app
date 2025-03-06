import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  json,
  boolean,
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
// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  contacts: many(contacts),
  lists: many(lists),
  emailTemplates: many(emailTemplates),
  campaigns: many(campaigns),
  sequences: many(sequences),
  apiKeys: many(apiKeys),
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
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull(),
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

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
export const contactsRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),

  contactsToLists: many(contactsToLists), // many-to-many

  emailMessages: many(emailMessages),
  contactSequences: many(contactSequences),
}));

// Lists (Segments of contacts)
export const lists = pgTable("lists", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  description: text("description"),

  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const listsRelations = relations(lists, ({ many, one }) => ({
  campaigns: many(campaigns),
  createdBy: one(users, {
    fields: [lists.createdById],
    references: [users.id],
  }),

  contactsToLists: many(contactsToLists), // many-to-many
}));

export const contactsToLists = pgTable(
  "contacts_to_lists",
  {
    contactId: uuid("user_id")
      .notNull()
      .references(() => contacts.id),
    listId: uuid("list_id")
      .notNull()
      .references(() => lists.id),
  },
  (t) => [
    primaryKey({
      columns: [t.contactId, t.listId],
    }),
  ]
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
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),
  type: text("type").default("html"),
  category: text("category").default("cold_email"),
  variables: json("variables").default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Campaigns
export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  description: text("description"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),

  status: text("status").default("draft"),
  templateId: uuid("template_id")
    .notNull()
    .references(() => emailTemplates.id),
  listId: uuid("list_id").references(() => lists.id), // Simplified list association
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

// Email Messages (Individual emails sent)
export const emailMessages = pgTable("email_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id, {
    onDelete: "set null",
  }),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").default("queued"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  clickedAt: timestamp("clicked_at", { withTimezone: true }),
  bouncedAt: timestamp("bounced_at", { withTimezone: true }),
  failedAt: timestamp("failed_at", { withTimezone: true }),
  failureReason: text("failure_reason"),
  emailProvider: text("email_provider"),
  messageId: text("message_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
// Email Tracking
export const emailOpens = pgTable("email_opens", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => emailMessages.id, { onDelete: "cascade" }),
  openedAt: timestamp("opened_at", { withTimezone: true }).defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"),
  device: text("device"),
});
export const emailClicks = pgTable("email_clicks", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => emailMessages.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  clickedAt: timestamp("clicked_at", { withTimezone: true }).defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"),
  device: text("device"),
});

// Sequences (Multi-step email campaigns)
export const sequences = pgTable("sequences", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),
  status: text("status").default("draft"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
// Sequence Steps
export const sequenceSteps = pgTable("sequence_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  sequenceId: uuid("sequence_id")
    .notNull()
    .references(() => sequences.id, { onDelete: "cascade" }),
  templateId: uuid("template_id")
    .notNull()
    .references(() => emailTemplates.id),
  order: integer("order").notNull(),
  delayDays: integer("delay_days").default(0),
  delayHours: integer("delay_hours").default(0),
  conditions: json("conditions").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
// Contact Sequence Status
export const contactSequences = pgTable("contact_sequences", {
  id: uuid("id").defaultRandom().primaryKey(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  sequenceId: uuid("sequence_id")
    .notNull()
    .references(() => sequences.id, { onDelete: "cascade" }),
  currentStepId: uuid("current_step_id").references(() => sequenceSteps.id),
  status: text("status").default("active"),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  nextSendAt: timestamp("next_send_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// API Keys (For integration with external services)
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const emailTemplatesRelations = relations(
  emailTemplates,
  ({ many, one }) => ({
    campaigns: many(campaigns),
    sequenceSteps: many(sequenceSteps),
    createdBy: one(users, {
      fields: [emailTemplates.createdById],
      references: [users.id],
    }),
  })
);

export const campaignsRelations = relations(campaigns, ({ many, one }) => ({
  template: one(emailTemplates, {
    fields: [campaigns.templateId],
    references: [emailTemplates.id],
  }),
  list: one(lists, {
    fields: [campaigns.listId],
    references: [lists.id],
  }),
  emailMessages: many(emailMessages),
  createdBy: one(users, {
    fields: [campaigns.createdById],
    references: [users.id],
  }),
}));

export const emailMessagesRelations = relations(
  emailMessages,
  ({ one, many }) => ({
    campaign: one(campaigns, {
      fields: [emailMessages.campaignId],
      references: [campaigns.id],
    }),
    contact: one(contacts, {
      fields: [emailMessages.contactId],
      references: [contacts.id],
    }),
    opens: many(emailOpens),
    clicks: many(emailClicks),
  })
);

export const sequencesRelations = relations(sequences, ({ many, one }) => ({
  steps: many(sequenceSteps),
  contactSequences: many(contactSequences),
  createdBy: one(users, {
    fields: [sequences.createdById],
    references: [users.id],
  }),
}));

export const sequenceStepsRelations = relations(sequenceSteps, ({ one }) => ({
  sequence: one(sequences, {
    fields: [sequenceSteps.sequenceId],
    references: [sequences.id],
  }),
  template: one(emailTemplates, {
    fields: [sequenceSteps.templateId],
    references: [emailTemplates.id],
  }),
}));

export const contactSequencesRelations = relations(
  contactSequences,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [contactSequences.contactId],
      references: [contacts.id],
    }),
    sequence: one(sequences, {
      fields: [contactSequences.sequenceId],
      references: [sequences.id],
    }),
    currentStep: one(sequenceSteps, {
      fields: [contactSequences.currentStepId],
      references: [sequenceSteps.id],
    }),
  })
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));
