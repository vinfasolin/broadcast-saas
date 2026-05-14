import { FieldValue, Timestamp, type DocumentReference } from "firebase-admin/firestore";
import { db } from "../shared/firebase-admin";
import type { BroadcastMessage } from "./messages.types";

const collectionName = "messages";

export const getDueScheduledMessages = async (limit = 100) => {
  const now = Timestamp.now();

  const snapshot = await db
    .collection(collectionName)
    .where("status", "==", "scheduled")
    .where("scheduledAt", "<=", now)
    .orderBy("scheduledAt", "asc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    reference: doc.ref,
    message: {
      id: doc.id,
      ...doc.data(),
    } as BroadcastMessage,
  }));
};

export const markMessagesAsSent = async (
  items: Array<{
    reference: DocumentReference;
  }>
) => {
  if (items.length === 0) {
    return;
  }

  const batch = db.batch();

  items.forEach(({ reference }) => {
    batch.update(reference, {
      status: "sent",
      sentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
};