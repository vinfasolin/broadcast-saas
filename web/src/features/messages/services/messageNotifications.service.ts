import { httpsCallable } from "firebase/functions";
import { functions } from "../../../config/firebase";

type SendWhatsappNotificationInput = {
  to: string | string[];
  text: string;
  externalId?: string;
};

const sendWhatsappNotificationCallable = httpsCallable<
  SendWhatsappNotificationInput,
  { ok: boolean }
>(functions, "sendWhatsappNotification");

export const sendWhatsappNotification = async (
  input: SendWhatsappNotificationInput
) => {
  if (!input.to || !input.text.trim()) {
    return;
  }

  await sendWhatsappNotificationCallable({
    to: input.to,
    text: input.text.trim(),
    externalId: input.externalId,
  });
};