import type { Timestamp } from "firebase/firestore";

export type Contact = {
  id: string;
  ownerId: string;
  connectionId: string;
  name: string;
  phone: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ContactInput = {
  connectionId: string;
  name: string;
  phone: string;
  email?: string;
};