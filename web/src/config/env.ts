type FirebaseEnv = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const readEnv = (key: string): string => {
  const value = import.meta.env[key];

  if (!value) {
    console.warn(`Missing environment variable: ${key}`);
  }

  return value ?? "";
};

export const env = {
  firebase: {
    apiKey: readEnv("VITE_FIREBASE_API_KEY"),
    authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnv("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: readEnv("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnv("VITE_FIREBASE_APP_ID"),
  } satisfies FirebaseEnv,

  useFirebaseEmulators: import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true",

  disablePhoneRecaptchaForTesting:
    import.meta.env.VITE_DISABLE_PHONE_RECAPTCHA_FOR_TESTING === "true",
};