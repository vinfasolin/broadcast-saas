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
import { readDocumentWithId } from "../../../shared/services/firestore.helpers";
import type { Contact, ContactInput } from "../types/contact.types";

const collectionName = "contacts";

export const subscribeContacts = (
  ownerId: string,
  connectionId: string | null,
  onNext: (contacts: Contact[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const constraints: QueryConstraint[] = [
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc"),
  ];

  if (connectionId) {
    constraints.splice(1, 0, where("connectionId", "==", connectionId));
  }

  const q = query(collection(db, collectionName), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      onNext(snapshot.docs.map((item) => readDocumentWithId<Contact>(item)));
    },
    onError
  );
};

export const createContact = async (ownerId: string, input: ContactInput) => {
  const reference = doc(collection(db, collectionName));

  await setDoc(reference, {
    id: reference.id,
    ownerId,
    connectionId: input.connectionId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() ?? "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
};

export const updateContact = async (contactId: string, input: ContactInput) => {
  await updateDoc(doc(db, collectionName, contactId), {
    connectionId: input.connectionId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() ?? "",
    updatedAt: serverTimestamp(),
  });
};

export const deleteContact = async (contactId: string) => {
  await deleteDoc(doc(db, collectionName, contactId));
};