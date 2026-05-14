import { z } from "zod";
import { isValidBrazilPhone } from "../../../shared/utils/phone.utils";

export const completeProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .max(100, "Nome muito longo."),

  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido."),

  phone: z
    .string()
    .trim()
    .refine(isValidBrazilPhone, "Informe um telefone válido."),

  companyName: z
    .string()
    .trim()
    .min(2, "Informe o nome da empresa.")
    .max(120, "Nome muito longo."),
});

export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;