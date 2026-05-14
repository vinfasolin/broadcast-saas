import { onAuthStateChanged, type ConfirmationResult, type User } from "firebase/auth";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { auth } from "../../config/firebase";
import {
  loginWithEmailAndPassword,
  loginWithGoogle,
  logoutFromFirebase,
  registerWithEmailAndPassword,
  startPhoneLogin,
} from "../../features/auth/services/auth.service";
import {
  completeUserProfile,
  ensureUserProfile,
  getUserProfile,
  type CompleteProfileInput,
} from "../../features/auth/services/profile.service";
import type { UserProfile } from "../../features/auth/types/auth.types";

type AuthContextValue = {
  currentUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogleProvider: () => Promise<void>;
  startPhoneAuthentication: (phone: string) => Promise<void>;
  confirmPhoneAuthentication: (code: string) => Promise<void>;
  completeProfile: (input: CompleteProfileInput) => Promise<void>;
  reloadProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneConfirmation, setPhoneConfirmation] = useState<ConfirmationResult | null>(null);

  const syncProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }

    const ensuredProfile = await ensureUserProfile(user);
    setProfile(ensuredProfile);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      try {
        setCurrentUser(user);
        await syncProfile(user);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [syncProfile]);

  const reloadProfile = useCallback(async () => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const nextProfile = await getUserProfile(currentUser.uid);
    setProfile(nextProfile);
  }, [currentUser]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    await loginWithEmailAndPassword(email, password);
  }, []);

  const registerWithEmail = useCallback(async (email: string, password: string) => {
    await registerWithEmailAndPassword(email, password);
  }, []);

  const loginWithGoogleProvider = useCallback(async () => {
    await loginWithGoogle();
  }, []);

  const startPhoneAuthentication = useCallback(async (phone: string) => {
    const confirmation = await startPhoneLogin(phone);
    setPhoneConfirmation(confirmation);
  }, []);

  const confirmPhoneAuthentication = useCallback(
    async (code: string) => {
      if (!phoneConfirmation) {
        throw new Error("Primeiro solicite o código SMS.");
      }

      await phoneConfirmation.confirm(code);
      setPhoneConfirmation(null);
    },
    [phoneConfirmation]
  );

  const completeProfile = useCallback(
    async (input: CompleteProfileInput) => {
      if (!currentUser) {
        throw new Error("Usuário não autenticado.");
      }

      const nextProfile = await completeUserProfile(currentUser.uid, input);
      setProfile(nextProfile);
    },
    [currentUser]
  );

  const logout = useCallback(async () => {
    await logoutFromFirebase();
    setCurrentUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      profile,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogleProvider,
      startPhoneAuthentication,
      confirmPhoneAuthentication,
      completeProfile,
      reloadProfile,
      logout,
    }),
    [
      currentUser,
      profile,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogleProvider,
      startPhoneAuthentication,
      confirmPhoneAuthentication,
      completeProfile,
      reloadProfile,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
