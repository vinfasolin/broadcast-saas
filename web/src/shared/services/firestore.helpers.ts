import {
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export const readDocumentWithId = <T>(snapshot: QueryDocumentSnapshot<DocumentData>): T => {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as T;
};

export const nowServerTimestamp = () => serverTimestamp();

export const dateToTimestamp = (value: Date | string | null | undefined) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Timestamp.fromDate(date);
};

export const timestampToDate = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  return null;
};
