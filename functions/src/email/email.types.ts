export type SendEmailPayload = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
};
