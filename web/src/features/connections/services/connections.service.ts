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
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { readDocumentWithId } from "../../../shared/services/firestore.helpers";
import type { Connection, ConnectionInput } from "../types/connection.types";

const collectionName = "connections";

export const subscribeConnections = (
  ownerId: string,
  onNext: (connections: Connection[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, collectionName),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onNext(snapshot.docs.map((item) => readDocumentWithId<Connection>(item)));
    },
    onError
  );
};

export const createConnection = async (ownerId: string, input: ConnectionInput) => {
  const reference = doc(collection(db, collectionName));

  await setDoc(reference, {
    id: reference.id,
    ownerId,
    name: input.name.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
};

export const updateConnection = async (connectionId: string, input: ConnectionInput) => {
  await updateDoc(doc(db, collectionName, connectionId), {
    name: input.name.trim(),
    updatedAt: serverTimestamp(),
  });
};

export const deleteConnection = async (connectionId: string) => {
  await deleteDoc(doc(db, collectionName, connectionId));
};