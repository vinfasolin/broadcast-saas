import { z } from "zod";
import { isValidBrazilPhone } from "../../../shared/utils/phone.utils";

export const contactSchema = z.object({
  connectionId: z.string().trim().min(1, "Selecione uma conexão."),

  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do contato.")
    .max(100, "Nome muito longo."),

  phone: z
    .string()
    .trim()
    .refine(isValidBrazilPhone, "Informe um telefone válido."),

  email: z
    .union([
      z.string().trim().email("Informe um e-mail válido."),
      z.literal(""),
    ])
    .optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;