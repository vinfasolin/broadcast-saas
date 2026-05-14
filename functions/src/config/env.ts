export const env = {
  mailApiUrl: process.env.MAIL_API_URL ?? "",
  mailApiKey: process.env.MAIL_API_KEY ?? "",
  mailFromName: process.env.MAIL_FROM_NAME ?? "Broadcast SaaS",
  mailConfigVersion: process.env.MAIL_CONFIG_VERSION ?? "",

  whatsappApiUrl: process.env.WHATSAPP_API_URL ?? "",
  whatsappApiToken: process.env.WHATSAPP_API_TOKEN ?? "",
  whatsappProvider: process.env.WHATSAPP_PROVIDER ?? "baileys",
  whatsappConfigVersion: process.env.WHATSAPP_CONFIG_VERSION ?? "",
};