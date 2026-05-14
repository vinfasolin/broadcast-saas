import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId =
  process.env.GCLOUD_PROJECT ??
  process.env.GCP_PROJECT ??
  process.env.GOOGLE_CLOUD_PROJECT ??
  "broadcast-saas-d82ee";

const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID ?? "default";

const apps = getApps();

export const adminApp = apps.length > 0 ? apps[0] : initializeApp({ projectId });

export const db = getFirestore(adminApp, firestoreDatabaseId);

export const adminAuth = getAuth(adminApp);