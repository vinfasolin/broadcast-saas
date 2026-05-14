import type { Timestamp } from "firebase-admin/firestore";

export type MessageStatus = "scheduled" | "sent";

export type BroadcastMessage = {
  id: string;
  ownerId: string;
  connectionId: string;
  contactIds: string[];
  contactEmails?: string[];
  content: string;
  status: MessageStatus;
  scheduledAt: Timestamp | null;
  sentAt: Timestamp | null;
  sendEmailCopy: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
