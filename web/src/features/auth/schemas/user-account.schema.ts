import { z } from "zod";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const userAccountSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe seu nome.")
      .max(120, "O nome deve ter no máximo 120 caracteres."),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Informe um e-mail válido.")),

    phone: z
      .string()
      .trim()
      .min(1, "Informe seu telefone.")
      .refine((value) => {
        const digits = onlyDigits(value);

        return digits.length === 10 || digits.length === 11;
      }, "Informe um telefone válido com DDD."),

    companyName: z
      .string()
      .trim()
      .min(2, "Informe o nome da empresa.")
      .max(120, "O nome da empresa deve ter no máximo 120 caracteres."),

    currentPassword: z.string().optional(),

    newPassword: z.string().optional(),

    confirmNewPassword: z.string().optional(),
  })
  .superRefine((data, context) => {
    const currentPassword = data.currentPassword?.trim() ?? "";
    const newPassword = data.newPassword?.trim() ?? "";
    const confirmNewPassword = data.confirmNewPassword?.trim() ?? "";

    const wantsToChangePassword = Boolean(newPassword || confirmNewPassword);

    if (!wantsToChangePassword) {
      return;
    }

    if (!currentPassword) {
      context.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "Informe sua senha atual para alterar a senha.",
      });
    }

    if (newPassword.length < 6) {
      context.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha deve ter pelo menos 6 caracteres.",
      });
    }

    if (newPassword !== confirmNewPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "A confirmação da senha não confere.",
      });
    }
  });

export type UserAccountFormData = z.infer<typeof userAccountSchema>;