import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { MessageStatus } from "../types/message.types";

type MessageFiltersProps = {
  status: MessageStatus | "";
  onStatusChange: (status: MessageStatus | "") => void;
};

export const MessageFilters = ({ status, onStatusChange }: MessageFiltersProps) => {
  return (
    <ToggleButtonGroup
      className="mb-5"
      exclusive
      value={status}
      onChange={(_, nextValue) => onStatusChange(nextValue ?? "")}
      size="small"
    >
      <ToggleButton value="">Todas</ToggleButton>
      <ToggleButton value="scheduled">Agendadas</ToggleButton>
      <ToggleButton value="sent">Enviadas</ToggleButton>
    </ToggleButtonGroup>
  );
};
