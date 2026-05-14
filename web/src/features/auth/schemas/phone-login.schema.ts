import { z } from "zod";
import { isValidBrazilPhone } from "../../../shared/utils/phone.utils";

export const phoneLoginSchema = z.object({
  phone: z.string().refine(isValidBrazilPhone, "Informe um telefone válido."),
  code: z.string().optional(),
});

export type PhoneLoginFormData = z.infer<typeof phoneLoginSchema>;
