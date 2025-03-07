//This class is used to create a TCP or IPC server.
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

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

import { AdapterAccountType } from "next-auth/adapters";

// Users Table Types
export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  // emailVerified: Date | null;
  // createdAt: Date;
};

// Next Auth Types
export type Account = {
  userId: string;
  type: AdapterAccountType;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
};
export type Session = {
  sessionToken: string;
  userId: string;
  expires: Date;
};
export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Date;
};

// Contacts Table Types
export type Contact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  companyName: string | null;
  jobTitle: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  website: string | null;
  industry: string | null;
  companySize: string | null;
  location: string | null;
  source: string | null;
  notes: string | null;
  tags: string[];
  customFields: Record<string, any>;
  isVerified: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

// Lists Types
export type List = {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Contact-List Relationship Types
export type ContactList = {
  contactId: string;
  listId: string;
  addedAt: Date;
};

// Email Templates Types
export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdById: string;
  type: string;
  category: string;
  variables: any[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Campaigns Types
export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  status: string;
  templateId: string;
  sendFromEmail: string;
  sendFromName: string;
  replyToEmail: string | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  completedAt: Date | null;
  trackOpens: boolean;
  trackClicks: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

// Campaign-List Relationship Types
export type CampaignList = {
  campaignId: string;
  listId: string;
  addedAt: Date;
};

// Email Messages Types
export type EmailMessage = {
  id: string;
  campaignId: string | null;
  contactId: string;
  subject: string;
  body: string;
  status: string;
  sentAt: Date | null;
  deliveredAt: Date | null;
  openedAt: Date | null;
  clickedAt: Date | null;
  bouncedAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;
  emailProvider: string | null;
  messageId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Email Tracking Types
export type EmailOpen = {
  id: string;
  messageId: string;
  openedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  device: string | null;
};

export type EmailClick = {
  id: string;
  messageId: string;
  url: string;
  clickedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  device: string | null;
};

// Sequences Types
export type Sequence = {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Sequence Steps Types
export type SequenceStep = {
  id: string;
  sequenceId: string;
  templateId: string;
  order: number;
  delayDays: number;
  delayHours: number;
  conditions: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Contact Sequence Status Types
export type ContactSequence = {
  id: string;
  contactId: string;
  sequenceId: string;
  currentStepId: string | null;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  nextSendAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// API Keys Types
export type ApiKey = {
  id: string;
  userId: string;
  name: string;
  key: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
};

// Relationships are handled by Drizzle ORM at runtime
// and don't need explicit TypeScript interfaces
