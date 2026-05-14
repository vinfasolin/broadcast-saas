import type { Timestamp } from "firebase/firestore";

export type AuthProviderType = "password" | "google" | "phone";

export type UserProfile = {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  profileCompleted: boolean;
  authProviders: AuthProviderType[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
