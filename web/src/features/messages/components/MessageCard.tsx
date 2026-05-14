import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Paper, Typography } from "@mui/material";
import { StatusChip } from "../../../shared/components/StatusChip";
import { timestampToDate } from "../../../shared/services/firestore.helpers";
import { formatDateTime } from "../../../shared/utils/date.utils";
import type { BroadcastMessage } from "../types/message.types";

type MessageCardProps = {
  message: BroadcastMessage;
  onEdit: (message: BroadcastMessage) => void;
  onDelete: (message: BroadcastMessage) => void;
};

export const MessageCard = ({ message, onEdit, onDelete }: MessageCardProps) => {
  const scheduledDate = message.scheduledAt
    ? formatDateTime(timestampToDate(message.scheduledAt))
    : "Data não informada";

  const sentDate = message.sentAt
    ? formatDateTime(timestampToDate(message.sentAt))
    : "Data não informada";

  const emailContactsCount = message.contactEmails?.length ?? 0;
  const whatsappContactsCount = message.contactPhones?.length ?? 0;

  return (
    <Paper className="rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <StatusChip status={message.status} />

          <Typography className="mt-3 whitespace-pre-line font-medium text-slate-900">
            {message.content}
          </Typography>

          <Typography className="mt-2 text-sm text-slate-500">
            Contatos selecionados: {message.contactIds.length}
          </Typography>

          {message.sendEmailCopy && (
            <Typography className="text-sm text-slate-500">
              Plus e-mail: ativado para {emailContactsCount} contato(s) com e-mail
            </Typography>
          )}

          {message.sendWhatsappCopy && (
            <Typography className="text-sm text-slate-500">
              Plus WhatsApp: ativado para {whatsappContactsCount} contato(s) com telefone
            </Typography>
          )}

          {message.status === "scheduled" && (
            <Typography className="text-sm text-slate-500">
              Agendada para: {scheduledDate}
            </Typography>
          )}

          {message.status === "sent" && (
            <Typography className="text-sm text-slate-500">
              Enviada em: {sentDate}
            </Typography>
          )}
        </div>

        <div className="flex shrink-0">
          <IconButton aria-label="Editar mensagem" onClick={() => onEdit(message)}>
            <EditIcon />
          </IconButton>

          <IconButton
            aria-label="Excluir mensagem"
            color="error"
            onClick={() => onDelete(message)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </div>
    </Paper>
  );
};