import { Box, MenuItem, TextField } from "@mui/material";
import type { Connection } from "../../connections/types/connection.types";

type ContactFiltersProps = {
  connectionId: string;
  searchTerm: string;
  connections: Connection[];
  onConnectionChange: (connectionId: string) => void;
  onSearchChange: (searchTerm: string) => void;
};

export const ContactFilters = ({
  connectionId,
  searchTerm,
  connections,
  onConnectionChange,
  onSearchChange,
}: ContactFiltersProps) => {
  return (
    <Box className="mb-5 grid gap-3 md:grid-cols-2 md:max-w-4xl">
      <TextField
        select
        label="Filtrar por conexão"
        value={connectionId}
        onChange={(event) => onConnectionChange(event.target.value)}
        fullWidth
      >
        <MenuItem value="">Todas as conexões</MenuItem>
        {connections.map((connection) => (
          <MenuItem key={connection.id} value={connection.id}>
            {connection.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Buscar por nome, telefone ou e-mail"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        fullWidth
        placeholder="Ex.: Richard, 4192003, gmail..."
      />
    </Box>
  );
};