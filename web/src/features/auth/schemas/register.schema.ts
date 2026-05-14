import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Informe seu e-mail.")
      .email("Informe um e-mail válido."),

    password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres."),

    passwordConfirmation: z
      .string()
      .min(6, "Confirme a senha."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "As senhas não conferem.",
  });

export type RegisterFormData = z.infer<typeof registerSchema>;