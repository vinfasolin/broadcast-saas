import { env } from "../config/env";
import { logError, logInfo } from "../shared/logger";
import type { SendEmailPayload } from "./email.types";

const normalizeRecipients = (to: string | string[]) => {
  const recipients = Array.isArray(to) ? to : [to];

  return recipients.map((recipient) => recipient.trim()).filter(Boolean);
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const buildHtmlFromText = (text: string) => {
  return `<p>${escapeHtml(text).replace(/\n/g, "<br />")}</p>`;
};

export const sendEmail = async (payload: SendEmailPayload) => {
  if (!env.mailApiUrl) {
    logInfo("mail_api_not_configured");
    return { skipped: true };
  }

  const recipients = normalizeRecipients(payload.to);

  if (recipients.length === 0) {
    return { skipped: true };
  }

  const text = payload.text?.trim();
  const html = payload.html?.trim() || (text ? buildHtmlFromText(text) : "");

  const results = await Promise.allSettled(
    recipients.map(async (recipient) => {
      const response = await fetch(env.mailApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(env.mailApiKey ? { "X-Api-Key": env.mailApiKey } : {}),
        },
        body: JSON.stringify({
          to: recipient,
          subject: payload.subject,
          text,
          html,
          fromName: env.mailFromName,
          ...(env.mailApiKey ? { api_key: env.mailApiKey } : {}),
        }),
      });

      const responseBody = await response.text();

      if (!response.ok) {
        throw new Error(
          `Mail API failed with status ${response.status}: ${responseBody}`
        );
      }

      if (!responseBody) {
        return { ok: true };
      }

      const parsedResponse = JSON.parse(responseBody) as {
        ok?: boolean;
        error?: string;
      };

      if (parsedResponse.ok === false) {
        throw new Error(
          `Mail API returned error: ${parsedResponse.error ?? "unknown_error"}`
        );
      }

      return parsedResponse;
    })
  );

  const rejected = results.filter((result) => result.status === "rejected");

  if (rejected.length > 0) {
    logError("mail_api_partial_failure", rejected[0].reason, {
      total: results.length,
      failed: rejected.length,
    });
  }

  return {
    skipped: false,
    total: results.length,
    failed: rejected.length,
  };
};

export const sendScheduledMessageEmailCopy = async (input: {
  recipients: string[];
  content: string;
}) => {
  return sendEmail({
    to: input.recipients,
    subject: "Mensagem Broadcast enviada",
    text: input.content,
    html: buildHtmlFromText(input.content),
  });
};