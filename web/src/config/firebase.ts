import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  initializeFirestore,
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
} from "firebase/functions";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __BROADCAST_FIREBASE_EMULATORS_CONNECTED__: boolean | undefined;
}

const FIRESTORE_DATABASE_ID = "default";

const app = initializeApp(env.firebase);

export const auth = getAuth(app);

auth.useDeviceLanguage();

if (env.disablePhoneRecaptchaForTesting) {
  auth.settings.appVerificationDisabledForTesting = true;
}

export const db = initializeFirestore(app, {}, FIRESTORE_DATABASE_ID);
export const functions = getFunctions(app, "southamerica-east1");

if (env.useFirebaseEmulators && !globalThis.__BROADCAST_FIREBASE_EMULATORS_CONNECTED__) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);

  globalThis.__BROADCAST_FIREBASE_EMULATORS_CONNECTED__ = true;
}