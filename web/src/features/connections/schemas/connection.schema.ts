import { z } from "zod";

export const connectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da conexão.")
    .max(80, "Nome muito longo."),
});

export type ConnectionFormData = z.infer<typeof connectionSchema>;