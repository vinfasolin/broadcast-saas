import type { Timestamp } from "firebase/firestore";

export type FirestoreBaseDocument = {
  id: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
