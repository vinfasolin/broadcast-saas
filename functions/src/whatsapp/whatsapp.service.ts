import { env } from "../config/env";
import { logError, logInfo } from "../shared/logger";
import type { SendWhatsappPayload, WhatsappSendResult } from "./whatsapp.types";

type SendWhatsappInternalResult = {
  skipped: boolean;
  total: number;
  failed: number;
  results: WhatsappSendResult[];
};

const MAX_WHATSAPP_MESSAGE_LENGTH = 4096;

const normalizePhone = (phone: string) => {
  const digits = phone.trim().replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
};

const normalizeRecipients = (to: string | string[]) => {
  const recipients = Array.isArray(to) ? to : [to];

  return Array.from(
    new Set(
      recipients
        .map((recipient) => normalizePhone(recipient))
        .filter(Boolean)
    )
  );
};

const parseJsonResponse = async (response: Response): Promise<WhatsappSendResult> => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as WhatsappSendResult;
  } catch {
    return {
      ok: response.ok,
      message: text,
    };
  }
};

const buildExternalId = (
  externalId: string | undefined,
  recipient: string,
  index: number
) => {
  if (!externalId) {
    return undefined;
  }

  return `${externalId}:${recipient}:${index}`;
};

export const sendWhatsappMessage = async (
  payload: SendWhatsappPayload
): Promise<SendWhatsappInternalResult> => {
  if (!env.whatsappApiUrl || !env.whatsappApiToken) {
    logInfo("whatsapp_api_not_configured", {
      hasUrl: Boolean(env.whatsappApiUrl),
      hasToken: Boolean(env.whatsappApiToken),
      provider: env.whatsappProvider,
      configVersion: env.whatsappConfigVersion,
    });

    return {
      skipped: true,
      total: 0,
      failed: 0,
      results: [],
    };
  }

  const recipients = normalizeRecipients(payload.to);
  const text = payload.text.trim().slice(0, MAX_WHATSAPP_MESSAGE_LENGTH);

  if (recipients.length === 0 || !text) {
    return {
      skipped: true,
      total: 0,
      failed: 0,
      results: [],
    };
  }

  const sendPromises: Promise<WhatsappSendResult>[] = recipients.map(
    async (recipient, index) => {
      const response = await fetch(env.whatsappApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-token": env.whatsappApiToken,
        },
        body: JSON.stringify({
          to: recipient,
          text,
          externalId: buildExternalId(payload.externalId, recipient, index),
        }),
      });

      const body = await parseJsonResponse(response);

      if (!response.ok || body.ok === false) {
        throw new Error(
          `WhatsApp API failed with status ${response.status}: ${JSON.stringify(body)}`
        );
      }

      return {
        ...body,
        provider: body.provider ?? env.whatsappProvider,
      };
    }
  );

  const results = await Promise.allSettled(sendPromises);

  const fulfilled: WhatsappSendResult[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      fulfilled.push(result.value);
    }
  }

  const rejected = results.filter((result) => result.status === "rejected");

  if (rejected.length > 0) {
    logError("whatsapp_api_partial_failure", rejected[0].reason, {
      total: results.length,
      failed: rejected.length,
      provider: env.whatsappProvider,
      configVersion: env.whatsappConfigVersion,
    });
  }

  return {
    skipped: false,
    total: results.length,
    failed: rejected.length,
    results: fulfilled,
  };
};

export const sendScheduledMessageWhatsappCopy = async (input: {
  recipients: string[];
  content: string;
  externalId?: string;
}) => {
  return sendWhatsappMessage({
    to: input.recipients,
    text: input.content,
    externalId: input.externalId,
  });
};