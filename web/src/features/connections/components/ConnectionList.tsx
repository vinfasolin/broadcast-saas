import { Box } from "@mui/material";
import { EmptyState } from "../../../shared/components/EmptyState";
import { ConnectionCard } from "./ConnectionCard";
import type { Connection } from "../types/connection.types";

type ConnectionListProps = {
  connections: Connection[];
  onCreate: () => void;
  onEdit: (connection: Connection) => void;
  onDelete: (connection: Connection) => void;
};

export const ConnectionList = ({
  connections,
  onCreate,
  onEdit,
  onDelete,
}: ConnectionListProps) => {
  if (connections.length === 0) {
    return (
      <EmptyState
        title="Nenhuma conexão cadastrada"
        description="Crie a primeira conexão para organizar seus contatos e mensagens."
        actionLabel="Nova conexão"
        onAction={onCreate}
      />
    );
  }

  return (
    <Box className="grid gap-3">
      {connections.map((connection) => (
        <ConnectionCard
          key={connection.id}
          connection={connection}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
};
