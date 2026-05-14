import { Chip } from "@mui/material";
import type { MessageStatus } from "../../features/messages/types/message.types";

type StatusChipProps = {
  status: MessageStatus;
};

const statusMap: Record<MessageStatus, { label: string; color: "success" | "warning" }> = {
  sent: {
    label: "Enviada",
    color: "success",
  },
  scheduled: {
    label: "Agendada",
    color: "warning",
  },
};

export const StatusChip = ({ status }: StatusChipProps) => {
  const item = statusMap[status];

  return <Chip size="small" label={item.label} color={item.color} />;
};
