import { getApp } from "firebase/app";
import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../../config/firebase";
import type { AuthProviderType, UserProfile } from "../types/auth.types";

const usersCollection = "users";
const functions = getFunctions(getApp(), "southamerica-east1");

const normalizeText = (value?: string | null) => value?.trim() ?? "";

const normalizeEmail = (value?: string | null) => normalizeText(value).toLowerCase();

const getAuthProviderTypes = (user: User): AuthProviderType[] => {
  const providers = user.providerData
    .map((provider) => {
      if (provider.providerId === "password") return "password";
      if (provider.providerId === "google.com") return "google";
      if (provider.providerId === "phone") return "phone";

      return null;
    })
    .filter(Boolean) as AuthProviderType[];

  return providers.length > 0 ? providers : ["password"];
};

const getSafeAuthProviders = (profile: UserProfile): AuthProviderType[] => {
  return Array.isArray(profile.authProviders) ? profile.authProviders : [];
};

export const isProfileCompleted = (profile: UserProfile | null) => {
  if (!profile) {
    return false;
  }

  return Boolean(
    normalizeText(profile.name) &&
      normalizeEmail(profile.email) &&
      normalizeText(profile.phone) &&
      normalizeText(profile.companyName)
  );
};

export const getUserProfile = async (userId: string) => {
  const reference = doc(db, usersCollection, userId);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as UserProfile;
};

export const ensureUserProfile = async (user: User) => {
  const reference = doc(db, usersCollection, user.uid);
  const snapshot = await getDoc(reference);

  if (snapshot.exists()) {
    const currentProfile = {
      id: snapshot.id,
      ...snapshot.data(),
    } as UserProfile;

    const nextProviders = Array.from(
      new Set([...getSafeAuthProviders(currentProfile), ...getAuthProviderTypes(user)])
    );

    const nextProfile = {
      ...currentProfile,
      name: normalizeText(currentProfile.name) || normalizeText(user.displayName),
      email: normalizeEmail(currentProfile.email) || normalizeEmail(user.email),
      phone: normalizeText(currentProfile.phone) || normalizeText(user.phoneNumber),
      companyName: normalizeText(currentProfile.companyName),
      authProviders: nextProviders,
    };

    const profileCompleted = isProfileCompleted(nextProfile);

    await updateDoc(reference, {
      name: nextProfile.name,
      email: nextProfile.email,
      phone: nextProfile.phone,
      companyName: nextProfile.companyName,
      profileCompleted,
      authProviders: nextProviders,
      updatedAt: serverTimestamp(),
    });

    return {
      ...nextProfile,
      profileCompleted,
    } as UserProfile;
  }

  const profileData = {
    id: user.uid,
    ownerId: user.uid,
    name: normalizeText(user.displayName),
    email: normalizeEmail(user.email),
    phone: normalizeText(user.phoneNumber),
    companyName: "",
    profileCompleted: false,
    authProviders: getAuthProviderTypes(user),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(reference, profileData);

  return getUserProfile(user.uid);
};

export type CompleteProfileInput = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
};

export type UpdateUserProfileInput = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
};

type UpdateUserProfileFunctionResponse = {
  ok: true;
  profile: {
    id: string;
    ownerId: string;
    name: string;
    email: string;
    phone: string;
    companyName: string;
    profileCompleted: boolean;
  };
};

type DeleteUserAccountFunctionResponse = {
  ok: true;
  deletedFirestoreDocuments: number;
};

const callUpdateUserProfileFunction = async (input: UpdateUserProfileInput) => {
  const updateProfileFunction = httpsCallable<
    UpdateUserProfileInput,
    UpdateUserProfileFunctionResponse
  >(functions, "updateUserProfile");

  return updateProfileFunction({
    name: normalizeText(input.name),
    email: normalizeEmail(input.email),
    phone: normalizeText(input.phone),
    companyName: normalizeText(input.companyName),
  });
};

export const completeUserProfile = async (
  userId: string,
  input: CompleteProfileInput
) => {
  await callUpdateUserProfileFunction(input);

  const profile = await getUserProfile(userId);

  if (!profile) {
    throw new Error("Não foi possível carregar o perfil atualizado.");
  }

  return profile;
};

export const updateUserProfile = async (
  userId: string,
  input: UpdateUserProfileInput
) => {
  await callUpdateUserProfileFunction(input);

  const profile = await getUserProfile(userId);

  if (!profile) {
    throw new Error("Não foi possível carregar o perfil atualizado.");
  }

  return profile;
};

export const deleteUserAccount = async () => {
  const deleteAccountFunction = httpsCallable<
    Record<string, never>,
    DeleteUserAccountFunctionResponse
  >(functions, "deleteUserAccount");

  await deleteAccountFunction({});
};