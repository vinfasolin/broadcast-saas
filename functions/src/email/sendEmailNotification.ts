import { HttpsError, onCall } from "firebase-functions/v2/https";
import { z } from "zod";
import { okResponse } from "../shared/response";
import { sendEmail } from "./email.service";

const emailSchema = z.string().trim().pipe(z.email());

const schema = z
  .object({
    to: z.union([emailSchema, z.array(emailSchema).min(1)]),
    subject: z.string().trim().min(1).max(160),
    text: z.string().trim().max(5000).optional(),
    html: z.string().trim().max(10000).optional(),
  })
  .refine((data) => Boolean(data.text || data.html), {
    message: "Informe o texto ou HTML do e-mail.",
    path: ["text"],
  });

export const sendEmailNotification = onCall(
  {
    region: "southamerica-east1",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "UsuÃ¡rio nÃ£o autenticado.");
    }

    const parsed = schema.safeParse(request.data);

    if (!parsed.success) {
      throw new HttpsError("invalid-argument", "Dados de e-mail invÃ¡lidos.");
    }

    await sendEmail(parsed.data);

    return okResponse();
  }
);