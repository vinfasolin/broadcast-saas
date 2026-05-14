import { z } from "zod";

export const messageSchema = z
  .object({
    connectionId: z.string().min(1, "Selecione uma conexão."),
    contactIds: z.array(z.string()).min(1, "Selecione pelo menos um contato."),
    content: z.string().min(1, "Digite a mensagem.").max(2000, "Mensagem muito longa."),
    status: z.enum(["sent", "scheduled"]),
    scheduledAt: z.string().optional(),
    sendEmailCopy: z.boolean(),
    sendWhatsappCopy: z.boolean(),
  })
  .refine((data) => data.status === "sent" || Boolean(data.scheduledAt), {
    path: ["scheduledAt"],
    message: "Informe a data e hora do agendamento.",
  });

export type MessageFormData = z.infer<typeof messageSchema>;