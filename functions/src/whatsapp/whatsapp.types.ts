export type SendWhatsappPayload = {
  to: string | string[];
  text: string;
  externalId?: string;
};

export type WhatsappSendResult = {
  ok?: boolean;
  channel?: string;
  provider?: string;
  externalId?: string;
  message?: string;
  to?: string;
  messageId?: string;
  sentAt?: string;
  timestamp?: string;
};