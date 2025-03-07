//This class is used to create a TCP or IPC server.
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

import { AdapterAccountType } from "next-auth/adapters";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  contacts,
  lists,
  contactsToLists,
  emailTemplates,
  campaigns,
  campaignsToLists,
  emailMessages,
  emailOpens,
  emailClicks,
  sequences,
  sequenceSteps,
  contactSequences,
  apiKeys,
} from "@/db/schema"; // Assuming this will be imported from your schema file

//create a custom Response type
export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

interface Route {
  href: string;
  title: string;
  icon: React.ReactNode;
}
export type RouteList = Route[];

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Next Auth types
export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;

export type VerificationToken = InferSelectModel<typeof verificationTokens>;
export type NewVerificationToken = InferInsertModel<typeof verificationTokens>;

// Contact types
export type Contact = InferSelectModel<typeof contacts>;
export type NewContact = InferInsertModel<typeof contacts>;

// List types
export type List = InferSelectModel<typeof lists>;
export type NewList = InferInsertModel<typeof lists>;

export type ContactToList = InferSelectModel<typeof contactsToLists>;
export type NewContactToList = InferInsertModel<typeof contactsToLists>;

// Email template types
export type EmailTemplate = InferSelectModel<typeof emailTemplates>;
export type NewEmailTemplate = InferInsertModel<typeof emailTemplates>;

// Campaign types
export type Campaign = InferSelectModel<typeof campaigns>;
export type NewCampaign = InferInsertModel<typeof campaigns>;

export type CampaignToList = InferSelectModel<typeof campaignsToLists>;
export type NewCampaignToList = InferInsertModel<typeof campaignsToLists>;

// Email message types
export type EmailMessage = InferSelectModel<typeof emailMessages>;
export type NewEmailMessage = InferInsertModel<typeof emailMessages>;

export type EmailOpen = InferSelectModel<typeof emailOpens>;
export type NewEmailOpen = InferInsertModel<typeof emailOpens>;

export type EmailClick = InferSelectModel<typeof emailClicks>;
export type NewEmailClick = InferInsertModel<typeof emailClicks>;

// Sequence types
export type Sequence = InferSelectModel<typeof sequences>;
export type NewSequence = InferInsertModel<typeof sequences>;

export type SequenceStep = InferSelectModel<typeof sequenceSteps>;
export type NewSequenceStep = InferInsertModel<typeof sequenceSteps>;

export type ContactSequence = InferSelectModel<typeof contactSequences>;
export type NewContactSequence = InferInsertModel<typeof contactSequences>;

// API key types
export type ApiKey = InferSelectModel<typeof apiKeys>;
export type NewApiKey = InferInsertModel<typeof apiKeys>;

// Custom field interfaces based on JSON columns
export interface ContactTags extends Array<string> {}

export interface ContactCustomFields {
  [key: string]: string | number | boolean | null;
}

export interface CampaignSettings {
  sendingWindow?: {
    startTime?: string;
    endTime?: string;
    timezone?: string;
  };
  throttling?: {
    emailsPerHour?: number;
    emailsPerDay?: number;
  };
  deliveryOptions?: {
    retryOnFail?: boolean;
    maxRetries?: number;
  };
  [key: string]: any;
}

export interface SequenceStepConditions {
  openedPrevious?: boolean;
  clickedPrevious?: boolean;
  replied?: boolean;
  customConditions?: {
    field: string;
    operator: "equals" | "contains" | "greaterThan" | "lessThan";
    value: string | number | boolean;
  }[];
  [key: string]: any;
}
// Relationships are handled by Drizzle ORM at runtime
// and don't need explicit TypeScript interfaces
