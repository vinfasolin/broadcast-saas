import {
  EmailAuthProvider,
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { auth } from "../../../config/firebase";
import { normalizeBrazilPhoneToE164 } from "../../../shared/utils/phone.utils";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getProviderIds = (user: User) => {
  return user.providerData.map((provider) => provider.providerId);
};

const hasPasswordProvider = (user: User) => {
  return getProviderIds(user).includes("password");
};

const hasGoogleProvider = (user: User) => {
  return getProviderIds(user).includes("google.com");
};

const getCurrentUserOrFail = () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  return user;
};

const reauthenticateCurrentUser = async (user: User, currentPassword?: string) => {
  if (hasPasswordProvider(user)) {
    if (!user.email) {
      throw new Error("Não foi possível identificar o e-mail atual da conta.");
    }

    if (!currentPassword) {
      throw new Error("Informe sua senha atual para confirmar a alteração.");
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    await reauthenticateWithCredential(user, credential);
    return;
  }

  if (hasGoogleProvider(user)) {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
    });

    await reauthenticateWithPopup(user, provider);
    return;
  }

  throw new Error(
    "Não foi possível confirmar sua identidade automaticamente para esta alteração."
  );
};

export const loginWithEmailAndPassword = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, normalizeEmail(email), password);
};

export const registerWithEmailAndPassword = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
};

export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  return signInWithPopup(auth, provider);
};

const clearRecaptchaVerifier = () => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = undefined;
  }
};

const createRecaptchaVerifier = () => {
  clearRecaptchaVerifier();

  const container = document.getElementById(RECAPTCHA_CONTAINER_ID);

  if (!container) {
    throw new Error("Container do reCAPTCHA não encontrado.");
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
    size: "normal",
    callback: () => {
      console.info("reCAPTCHA validado com sucesso.");
    },
    "expired-callback": () => {
      console.warn("reCAPTCHA expirado. Gere o código SMS novamente.");
      clearRecaptchaVerifier();
    },
  });

  return window.recaptchaVerifier;
};

export const startPhoneLogin = async (phone: string): Promise<ConfirmationResult> => {
  const normalizedPhone = normalizeBrazilPhoneToE164(phone);

  if (!normalizedPhone) {
    throw new Error("Telefone inválido.");
  }

  const verifier = createRecaptchaVerifier();

  try {
    return await signInWithPhoneNumber(auth, normalizedPhone, verifier);
  } catch (error) {
    clearRecaptchaVerifier();
    throw error;
  }
};

export const updateCurrentUserDisplayName = async (name: string) => {
  const user = getCurrentUserOrFail();
  const displayName = name.trim();

  if (!displayName) {
    throw new Error("Informe seu nome.");
  }

  await updateProfile(user, {
    displayName,
  });

  await user.reload();

  return auth.currentUser;
};

export const updateCurrentUserEmail = async (email: string, currentPassword?: string) => {
  const user = getCurrentUserOrFail();
  const nextEmail = normalizeEmail(email);
  const currentEmail = normalizeEmail(user.email ?? "");

  if (!nextEmail) {
    throw new Error("Informe um e-mail válido.");
  }

  if (nextEmail === currentEmail) {
    return user;
  }

  await reauthenticateCurrentUser(user, currentPassword);
  await updateEmail(user, nextEmail);
  await user.reload();

  return auth.currentUser;
};

export const updateCurrentUserPassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const user = getCurrentUserOrFail();

  if (!hasPasswordProvider(user)) {
    throw new Error("Alteração de senha disponível apenas para contas com login por e-mail e senha.");
  }

  if (!currentPassword) {
    throw new Error("Informe sua senha atual.");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
  }

  await reauthenticateCurrentUser(user, currentPassword);
  await updatePassword(user, newPassword);
  await user.reload();

  return auth.currentUser;
};

export const logoutFromFirebase = () => {
  clearRecaptchaVerifier();

  return signOut(auth);
};