import type { Timestamp } from "firebase/firestore";

export type MessageStatus = "scheduled" | "sent";

export type BroadcastMessage = {
  id: string;
  ownerId: string;
  connectionId: string;
  contactIds: string[];
  contactEmails?: string[];
  contactPhones?: string[];
  content: string;
  status: MessageStatus;
  scheduledAt: Timestamp | null;
  sentAt: Timestamp | null;
  sendEmailCopy: boolean;
  sendWhatsappCopy?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type MessageInput = {
  connectionId: string;
  contactIds: string[];
  contactEmails?: string[];
  contactPhones?: string[];
  content: string;
  status: MessageStatus;
  scheduledAt: string;
  sendEmailCopy: boolean;
  sendWhatsappCopy?: boolean;
};