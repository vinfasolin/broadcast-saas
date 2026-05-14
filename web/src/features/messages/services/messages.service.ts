import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import {
  dateToTimestamp,
  readDocumentWithId,
} from "../../../shared/services/firestore.helpers";
import type {
  BroadcastMessage,
  MessageInput,
  MessageStatus,
} from "../types/message.types";

const collectionName = "messages";

type MessageFilters = {
  status?: MessageStatus | "";
};

export const subscribeMessages = (
  ownerId: string,
  filters: MessageFilters,
  onNext: (messages: BroadcastMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const constraints: QueryConstraint[] = [
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc"),
  ];

  if (filters.status) {
    constraints.splice(1, 0, where("status", "==", filters.status));
  }

  const q = query(collection(db, collectionName), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      onNext(snapshot.docs.map((item) => readDocumentWithId<BroadcastMessage>(item)));
    },
    onError
  );
};

export const createMessage = async (ownerId: string, input: MessageInput) => {
  const isSent = input.status === "sent";
  const reference = doc(collection(db, collectionName));

  await setDoc(reference, {
    id: reference.id,
    ownerId,
    connectionId: input.connectionId,
    contactIds: input.contactIds,
    contactEmails: input.contactEmails ?? [],
    contactPhones: input.contactPhones ?? [],
    content: input.content.trim(),
    status: input.status,
    scheduledAt: isSent || !input.scheduledAt ? null : dateToTimestamp(input.scheduledAt),
    sentAt: isSent ? serverTimestamp() : null,
    sendEmailCopy: input.sendEmailCopy,
    sendWhatsappCopy: Boolean(input.sendWhatsappCopy),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
};

export const updateMessage = async (messageId: string, input: MessageInput) => {
  const isSent = input.status === "sent";

  await updateDoc(doc(db, collectionName, messageId), {
    connectionId: input.connectionId,
    contactIds: input.contactIds,
    contactEmails: input.contactEmails ?? [],
    contactPhones: input.contactPhones ?? [],
    content: input.content.trim(),
    status: input.status,
    scheduledAt: isSent || !input.scheduledAt ? null : dateToTimestamp(input.scheduledAt),
    sentAt: isSent ? serverTimestamp() : null,
    sendEmailCopy: input.sendEmailCopy,
    sendWhatsappCopy: Boolean(input.sendWhatsappCopy),
    updatedAt: serverTimestamp(),
  });
};

export const deleteMessage = async (messageId: string) => {
  await deleteDoc(doc(db, collectionName, messageId));
};