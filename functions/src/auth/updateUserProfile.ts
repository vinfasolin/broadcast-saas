import { createHash } from "node:crypto";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { FieldValue, type QuerySnapshot } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../shared/firebase-admin";
import { logError, logInfo } from "../shared/logger";
import { okResponse } from "../shared/response";

const usersCollection = "users";
const uniqueFieldsCollection = "user_unique_fields";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const normalizeText = (value?: string | null) => value?.trim() ?? "";

const normalizeEmail = (value?: string | null) => normalizeText(value).toLowerCase();

const normalizeBrazilPhoneToUnique = (value?: string | null) => {
  const digits = onlyDigits(normalizeText(value));

  if (!digits) {
    return "";
  }

  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  return "";
};

const formatBrazilPhone = (value: string) => {
  const digits = onlyDigits(value);

  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    const localDigits = digits.slice(2);

    if (localDigits.length === 10) {
      return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`;
    }

    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  return normalizeText(value);
};

const createUniqueHash = (value: string) => {
  return createHash("sha256").update(value).digest("hex");
};

const createUniqueDocumentId = (type: "email" | "phone", value: string) => {
  return `${type}_${createUniqueHash(value)}`;
};

const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return "";
  }

  const visible = name.slice(0, 2);
  const hiddenLength = Math.min(Math.max(name.length - 2, 1), 8);

  return `${visible}${"*".repeat(hiddenLength)}@${domain}`;
};

const maskPhone = (phone: string) => {
  const digits = onlyDigits(phone);

  if (digits.length < 4) {
    return "";
  }

  return `***${digits.slice(-4)}`;
};

const readString = (value: unknown) => {
  return typeof value === "string" ? value : "";
};

const createLegacyPhoneSearchValues = (
  formattedPhone: string,
  phoneUniqueValue: string
) => {
  const values = new Set<string>();
  const uniqueDigits = onlyDigits(phoneUniqueValue);
  const localDigits = uniqueDigits.startsWith("55") ? uniqueDigits.slice(2) : uniqueDigits;

  values.add(formattedPhone);
  values.add(phoneUniqueValue);
  values.add(uniqueDigits);
  values.add(localDigits);

  if (localDigits.length === 10 || localDigits.length === 11) {
    values.add(formatBrazilPhone(localDigits));
    values.add(`+55${localDigits}`);
    values.add(`55${localDigits}`);
  }

  return Array.from(values).filter(Boolean);
};

const assertUsersSnapshotHasNoOtherUser = (
  snapshot: QuerySnapshot,
  userId: string,
  message: string
) => {
  const duplicatedUser = snapshot.docs.find((document) => document.id !== userId);

  if (duplicatedUser) {
    throw new HttpsError("already-exists", message);
  }
};

const profileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe seu nome.")
      .max(120, "O nome deve ter no mÃ¡ximo 120 caracteres."),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Informe um e-mail vÃ¡lido.")),

    phone: z
      .string()
      .trim()
      .min(1, "Informe seu telefone."),

    companyName: z
      .string()
      .trim()
      .min(2, "Informe o nome da empresa.")
      .max(120, "O nome da empresa deve ter no mÃ¡ximo 120 caracteres."),
  })
  .superRefine((data, context) => {
    const phoneUniqueValue = normalizeBrazilPhoneToUnique(data.phone);

    if (!phoneUniqueValue) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Informe um telefone vÃ¡lido com DDD.",
      });
    }
  });

export const updateUserProfile = onCall(
  {
    region: "southamerica-east1",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "UsuÃ¡rio nÃ£o autenticado.");
    }

    const parsed = profileSchema.safeParse(request.data);

    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        parsed.error.issues[0]?.message ?? "Dados invÃ¡lidos."
      );
    }

    const userId = request.auth.uid;

    const profileData = {
      name: normalizeText(parsed.data.name),
      email: normalizeEmail(parsed.data.email),
      phone: formatBrazilPhone(parsed.data.phone),
      companyName: normalizeText(parsed.data.companyName),
    };

    const nextEmailUniqueValue = normalizeEmail(profileData.email);
    const nextPhoneUniqueValue = normalizeBrazilPhoneToUnique(profileData.phone);
    const legacyPhoneSearchValues = createLegacyPhoneSearchValues(
      profileData.phone,
      nextPhoneUniqueValue
    );

    if (!nextPhoneUniqueValue) {
      throw new HttpsError("invalid-argument", "Informe um telefone vÃ¡lido com DDD.");
    }

    try {
      const profile = await db.runTransaction(async (transaction) => {
        const userReference = db.collection(usersCollection).doc(userId);
        const userSnapshot = await transaction.get(userReference);
        const currentData = userSnapshot.exists ? userSnapshot.data() ?? {} : {};

        const currentEmailUniqueValue =
          normalizeEmail(readString(currentData.emailUniqueValue)) ||
          normalizeEmail(readString(currentData.email));

        const currentPhoneUniqueValue =
          normalizeBrazilPhoneToUnique(readString(currentData.phoneUniqueValue)) ||
          normalizeBrazilPhoneToUnique(readString(currentData.phone));

        const emailUniqueReference = db
          .collection(uniqueFieldsCollection)
          .doc(createUniqueDocumentId("email", nextEmailUniqueValue));

        const phoneUniqueReference = db
          .collection(uniqueFieldsCollection)
          .doc(createUniqueDocumentId("phone", nextPhoneUniqueValue));

        const previousEmailUniqueReference =
          currentEmailUniqueValue && currentEmailUniqueValue !== nextEmailUniqueValue ?
            db
              .collection(uniqueFieldsCollection)
              .doc(createUniqueDocumentId("email", currentEmailUniqueValue)) :
            null;

        const previousPhoneUniqueReference =
          currentPhoneUniqueValue && currentPhoneUniqueValue !== nextPhoneUniqueValue ?
            db
              .collection(uniqueFieldsCollection)
              .doc(createUniqueDocumentId("phone", currentPhoneUniqueValue)) :
            null;

        const emailUniqueSnapshot = await transaction.get(emailUniqueReference);
        const phoneUniqueSnapshot = await transaction.get(phoneUniqueReference);

        const previousEmailUniqueSnapshot = previousEmailUniqueReference ?
          await transaction.get(previousEmailUniqueReference) :
          null;

        const previousPhoneUniqueSnapshot = previousPhoneUniqueReference ?
          await transaction.get(previousPhoneUniqueReference) :
          null;

        const usersByEmailSnapshot = await transaction.get(
          db
            .collection(usersCollection)
            .where("email", "==", nextEmailUniqueValue)
            .limit(2)
        );

        const usersByEmailUniqueSnapshot = await transaction.get(
          db
            .collection(usersCollection)
            .where("emailUniqueValue", "==", nextEmailUniqueValue)
            .limit(2)
        );

        const usersByPhoneUniqueSnapshot = await transaction.get(
          db
            .collection(usersCollection)
            .where("phoneUniqueValue", "==", nextPhoneUniqueValue)
            .limit(2)
        );

        const usersByLegacyPhoneSnapshots: QuerySnapshot[] = [];

        for (const phoneValue of legacyPhoneSearchValues) {
          const usersByPhoneSnapshot = await transaction.get(
            db
              .collection(usersCollection)
              .where("phone", "==", phoneValue)
              .limit(2)
          );

          usersByLegacyPhoneSnapshots.push(usersByPhoneSnapshot);
        }

        if (
          emailUniqueSnapshot.exists &&
          emailUniqueSnapshot.data()?.userId !== userId
        ) {
          throw new HttpsError("already-exists", "Este e-mail jÃ¡ estÃ¡ cadastrado.");
        }

        if (
          phoneUniqueSnapshot.exists &&
          phoneUniqueSnapshot.data()?.userId !== userId
        ) {
          throw new HttpsError("already-exists", "Este telefone jÃ¡ estÃ¡ cadastrado.");
        }

        assertUsersSnapshotHasNoOtherUser(
          usersByEmailSnapshot,
          userId,
          "Este e-mail jÃ¡ estÃ¡ cadastrado."
        );

        assertUsersSnapshotHasNoOtherUser(
          usersByEmailUniqueSnapshot,
          userId,
          "Este e-mail jÃ¡ estÃ¡ cadastrado."
        );

        assertUsersSnapshotHasNoOtherUser(
          usersByPhoneUniqueSnapshot,
          userId,
          "Este telefone jÃ¡ estÃ¡ cadastrado."
        );

        usersByLegacyPhoneSnapshots.forEach((snapshot) => {
          assertUsersSnapshotHasNoOtherUser(
            snapshot,
            userId,
            "Este telefone jÃ¡ estÃ¡ cadastrado."
          );
        });

        if (
          previousEmailUniqueReference &&
          previousEmailUniqueSnapshot?.exists &&
          previousEmailUniqueSnapshot.data()?.userId === userId
        ) {
          transaction.delete(previousEmailUniqueReference);
        }

        if (
          previousPhoneUniqueReference &&
          previousPhoneUniqueSnapshot?.exists &&
          previousPhoneUniqueSnapshot.data()?.userId === userId
        ) {
          transaction.delete(previousPhoneUniqueReference);
        }

        transaction.set(
          emailUniqueReference,
          {
            type: "email",
            userId,
            ownerId: userId,
            valueHash: createUniqueHash(nextEmailUniqueValue),
            maskedValue: maskEmail(nextEmailUniqueValue),
            updatedAt: FieldValue.serverTimestamp(),
            createdAt: emailUniqueSnapshot.exists ?
              emailUniqueSnapshot.data()?.createdAt ?? FieldValue.serverTimestamp() :
              FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        transaction.set(
          phoneUniqueReference,
          {
            type: "phone",
            userId,
            ownerId: userId,
            valueHash: createUniqueHash(nextPhoneUniqueValue),
            maskedValue: maskPhone(nextPhoneUniqueValue),
            updatedAt: FieldValue.serverTimestamp(),
            createdAt: phoneUniqueSnapshot.exists ?
              phoneUniqueSnapshot.data()?.createdAt ?? FieldValue.serverTimestamp() :
              FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        const nextProfile = {
          id: userId,
          ownerId: userId,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          companyName: profileData.companyName,
          emailUniqueValue: nextEmailUniqueValue,
          phoneUniqueValue: nextPhoneUniqueValue,
          profileCompleted: true,
        };

        transaction.set(
          userReference,
          {
            ...nextProfile,
            updatedAt: FieldValue.serverTimestamp(),
            ...(userSnapshot.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
          },
          { merge: true }
        );

        return nextProfile;
      });

      logInfo("user_profile_updated", {
        userId,
        email: maskEmail(profile.email),
        phone: maskPhone(profile.phoneUniqueValue),
      });

      return okResponse({
        profile,
      });
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logError("user_profile_update_failed", error, {
        userId,
      });

      throw new HttpsError(
        "internal",
        "NÃ£o foi possÃ­vel atualizar os dados da conta agora."
      );
    }
  }
);