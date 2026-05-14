import { onSchedule } from "firebase-functions/v2/scheduler";
import { sendScheduledMessageEmailCopy } from "../email/email.service";
import { logError, logInfo } from "../shared/logger";
import { sendScheduledMessageWhatsappCopy } from "../whatsapp/whatsapp.service";
import { getDueScheduledMessages, markMessagesAsSent } from "./messages.repository";

type WhatsappMessageFields = {
  sendWhatsappCopy: boolean;
  contactPhones: string[];
};

const getWhatsappFields = (message: unknown): WhatsappMessageFields => {
  const data = message as {
    sendWhatsappCopy?: unknown;
    contactPhones?: unknown;
  };

  const contactPhones: string[] = [];

  if (Array.isArray(data.contactPhones)) {
    data.contactPhones.forEach((phone) => {
      if (typeof phone === "string") {
        contactPhones.push(phone);
      }
    });
  }

  return {
    sendWhatsappCopy: data.sendWhatsappCopy === true,
    contactPhones,
  };
};

const getErrorDetails = (error: unknown) => {
  if (!(error instanceof Error)) {
    return {
      errorType: typeof error,
      errorValue: String(error),
    };
  }

  const errorWithMetadata = error as Error & {
    code?: string | number;
    details?: unknown;
    metadata?: unknown;
  };

  return {
    name: errorWithMetadata.name,
    message: errorWithMetadata.message,
    code: errorWithMetadata.code,
    details: errorWithMetadata.details,
    metadata: errorWithMetadata.metadata,
    stack: errorWithMetadata.stack,
    projectId:
      process.env.GCLOUD_PROJECT ??
      process.env.GCP_PROJECT ??
      process.env.GOOGLE_CLOUD_PROJECT ??
      "broadcast-saas-d82ee",
  };
};

export const processScheduledMessages = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "America/Sao_Paulo",
    region: "southamerica-east1",
  },
  async () => {
    try {
      logInfo("scheduled_messages_started", {
        projectId:
          process.env.GCLOUD_PROJECT ??
          process.env.GCP_PROJECT ??
          process.env.GOOGLE_CLOUD_PROJECT ??
          "broadcast-saas-d82ee",
      });

      const items = await getDueScheduledMessages(100);

      if (items.length === 0) {
        logInfo("scheduled_messages_none_due");
        return;
      }

      await markMessagesAsSent(items);

      await Promise.allSettled(
        items.map(async ({ message }) => {
          const hasEmailCopy =
            message.sendEmailCopy &&
            message.contactEmails &&
            message.contactEmails.length > 0;

          if (!hasEmailCopy) {
            return;
          }

          try {
            await sendScheduledMessageEmailCopy({
              recipients: message.contactEmails ?? [],
              content: message.content,
            });
          } catch (error) {
            logError("scheduled_message_email_copy_failed", error, {
              messageId: message.id,
              ownerId: message.ownerId,
            });
          }
        })
      );

      await Promise.allSettled(
        items.map(async ({ message }) => {
          const whatsappFields = getWhatsappFields(message);

          if (
            !whatsappFields.sendWhatsappCopy ||
            whatsappFields.contactPhones.length === 0
          ) {
            return;
          }

          try {
            await sendScheduledMessageWhatsappCopy({
              recipients: whatsappFields.contactPhones,
              content: message.content,
              externalId: message.id,
            });
          } catch (error) {
            logError("scheduled_message_whatsapp_copy_failed", error, {
              messageId: message.id,
              ownerId: message.ownerId,
            });
          }
        })
      );

      logInfo("scheduled_messages_processed", {
        total: items.length,
      });
    } catch (error) {
      logError(
        "scheduled_messages_processing_failed",
        error,
        getErrorDetails(error)
      );

      throw error;
    }
  }
);