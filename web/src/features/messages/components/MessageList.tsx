import { Box } from "@mui/material";
import { EmptyState } from "../../../shared/components/EmptyState";
import { MessageCard } from "./MessageCard";
import type { BroadcastMessage } from "../types/message.types";

type MessageListProps = {
  messages: BroadcastMessage[];
  onCreate: () => void;
  onEdit: (message: BroadcastMessage) => void;
  onDelete: (message: BroadcastMessage) => void;
};

export const MessageList = ({ messages, onCreate, onEdit, onDelete }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <EmptyState
        title="Nenhuma mensagem cadastrada"
        description="Crie mensagens fake, envie agora ou agende para depois."
        actionLabel="Nova mensagem"
        onAction={onCreate}
      />
    );
  }

  return (
    <Box className="grid gap-3">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
};
