import { httpsCallable } from "firebase/functions";
import { functions } from "../../config/firebase";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
};

export const sendEmailNotification = async (payload: SendEmailInput) => {
  const callable = httpsCallable<SendEmailInput, { ok: boolean }>(
    functions,
    "sendEmailNotification"
  );

  const response = await callable(payload);

  return response.data;
};
