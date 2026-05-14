import { HttpsError, onCall } from "firebase-functions/v2/https";
import { z } from "zod";
import { okResponse } from "../shared/response";
import { sendWhatsappMessage } from "./whatsapp.service";

const phoneSchema = z
  .string()
  .trim()
  .min(8)
  .max(32)
  .refine((value) => value.replace(/\D/g, "").length >= 10, {
    message: "Informe um telefone vÃ¡lido com DDD.",
  });

const schema = z.object({
  to: z.union([phoneSchema, z.array(phoneSchema).min(1)]),
  text: z.string().trim().min(1).max(4096),
  externalId: z.string().trim().max(160).optional(),
});

export const sendWhatsappNotification = onCall(
  {
    region: "southamerica-east1",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "UsuÃ¡rio nÃ£o autenticado.");
    }

    const parsed = schema.safeParse(request.data);

    if (!parsed.success) {
      throw new HttpsError("invalid-argument", "Dados de WhatsApp invÃ¡lidos.");
    }

    const result = await sendWhatsappMessage(parsed.data);

    if (!result.skipped && result.failed > 0) {
      throw new HttpsError(
        "internal",
        "NÃ£o foi possÃ­vel enviar uma ou mais mensagens pelo WhatsApp."
      );
    }

    return okResponse();
  }
);