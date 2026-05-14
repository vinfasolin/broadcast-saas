import {
  type DocumentData,
  type DocumentReference,
  type QuerySnapshot,
} from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { adminAuth, db } from "../shared/firebase-admin";
import { logError, logInfo } from "../shared/logger";
import { okResponse } from "../shared/response";

const usersCollection = "users";
const connectionsCollection = "connections";
const contactsCollection = "contacts";
const messagesCollection = "messages";
const uniqueFieldsCollection = "user_unique_fields";

const maxBatchOperations = 450;

const collectSnapshotReferences = (
  snapshot: QuerySnapshot<DocumentData>,
  referencesByPath: Map<string, DocumentReference<DocumentData>>
) => {
  snapshot.docs.forEach((document) => {
    referencesByPath.set(document.ref.path, document.ref);
  });
};

const deleteReferencesInBatches = async (
  references: DocumentReference<DocumentData>[]
) => {
  let batch = db.batch();
  let operationCount = 0;
  let deletedCount = 0;

  for (const reference of references) {
    batch.delete(reference);
    operationCount += 1;
    deletedCount += 1;

    if (operationCount >= maxBatchOperations) {
      await batch.commit();
      batch = db.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }

  return deletedCount;
};

const isAuthUserNotFoundError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "auth/user-not-found"
  );
};

export const deleteUserAccount = onCall(
  {
    region: "southamerica-east1",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "UsuÃ¡rio nÃ£o autenticado.");
    }

    const userId = request.auth.uid;

    try {
      logInfo("user_account_delete_started", {
        userId,
      });

      const referencesByPath = new Map<string, DocumentReference<DocumentData>>();

      const userReference = db.collection(usersCollection).doc(userId);
      referencesByPath.set(userReference.path, userReference);

      const connectionsSnapshot = await db
        .collection(connectionsCollection)
        .where("ownerId", "==", userId)
        .get();

      const contactsSnapshot = await db
        .collection(contactsCollection)
        .where("ownerId", "==", userId)
        .get();

      const messagesSnapshot = await db
        .collection(messagesCollection)
        .where("ownerId", "==", userId)
        .get();

      const uniqueFieldsByUserSnapshot = await db
        .collection(uniqueFieldsCollection)
        .where("userId", "==", userId)
        .get();

      const uniqueFieldsByOwnerSnapshot = await db
        .collection(uniqueFieldsCollection)
        .where("ownerId", "==", userId)
        .get();

      collectSnapshotReferences(connectionsSnapshot, referencesByPath);
      collectSnapshotReferences(contactsSnapshot, referencesByPath);
      collectSnapshotReferences(messagesSnapshot, referencesByPath);
      collectSnapshotReferences(uniqueFieldsByUserSnapshot, referencesByPath);
      collectSnapshotReferences(uniqueFieldsByOwnerSnapshot, referencesByPath);

      logInfo("user_account_delete_documents_collected", {
        userId,
        totalDocuments: referencesByPath.size,
        connections: connectionsSnapshot.size,
        contacts: contactsSnapshot.size,
        messages: messagesSnapshot.size,
        uniqueFieldsByUser: uniqueFieldsByUserSnapshot.size,
        uniqueFieldsByOwner: uniqueFieldsByOwnerSnapshot.size,
      });

      try {
        logInfo("user_account_auth_delete_started", {
          userId,
        });

        await adminAuth.deleteUser(userId);

        logInfo("user_account_auth_deleted", {
          userId,
        });
      } catch (error) {
        if (isAuthUserNotFoundError(error)) {
          logInfo("user_account_auth_already_deleted", {
            userId,
          });
        } else {
          logError("user_account_auth_delete_failed", error, {
            userId,
          });

          throw new HttpsError(
            "internal",
            "NÃ£o foi possÃ­vel excluir seu usuÃ¡rio de autenticaÃ§Ã£o agora."
          );
        }
      }

      const deletedFirestoreDocuments = await deleteReferencesInBatches(
        Array.from(referencesByPath.values())
      );

      logInfo("user_account_firestore_deleted", {
        userId,
        deletedFirestoreDocuments,
      });

      logInfo("user_account_deleted", {
        userId,
        deletedFirestoreDocuments,
      });

      return okResponse({
        deletedFirestoreDocuments,
      });
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logError("user_account_delete_failed", error, {
        userId,
      });

      throw new HttpsError(
        "internal",
        "NÃ£o foi possÃ­vel excluir sua conta agora. Tente novamente em alguns instantes."
      );
    }
  }
);