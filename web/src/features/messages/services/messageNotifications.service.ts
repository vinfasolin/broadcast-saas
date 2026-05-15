import { httpsCallable } from "firebase/functions";
import { functions } from "../../../config/firebase";

type NotificationRecipients = string | string[];

type SendWhatsappNotificationInput = {
  to: NotificationRecipients;
  text: string;
  externalId?: string;
};

type SendEmailNotificationInput = {
  to: NotificationRecipients;
  subject: string;
  text?: string;
  html?: string;
};

const hasRecipients = (to: NotificationRecipients) => {
  if (Array.isArray(to)) {
    return to.length > 0;
  }

  return Boolean(to.trim());
};

const sendWhatsappNotificationCallable = httpsCallable<
  SendWhatsappNotificationInput,
  { ok: boolean }
>(functions, "sendWhatsappNotification");

const sendEmailNotificationCallable = httpsCallable<
  SendEmailNotificationInput,
  { ok: boolean }
>(functions, "sendEmailNotification");

export const sendWhatsappNotification = async (
  input: SendWhatsappNotificationInput
) => {
  const text = input.text.trim();

  if (!hasRecipients(input.to) || !text) {
    return;
  }

  await sendWhatsappNotificationCallable({
    to: input.to,
    text,
    externalId: input.externalId,
  });
};

export const sendEmailNotification = async (
  input: SendEmailNotificationInput
) => {
  const subject = input.subject.trim();
  const text = input.text?.trim();
  const html = input.html?.trim();

  if (!hasRecipients(input.to) || !subject || (!text && !html)) {
    return;
  }

  await sendEmailNotificationCallable({
    to: input.to,
    subject,
    text,
    html,
  });
};