import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Paper, Typography } from "@mui/material";
import type { Connection } from "../types/connection.types";

type ConnectionCardProps = {
  connection: Connection;
  onEdit: (connection: Connection) => void;
  onDelete: (connection: Connection) => void;
};

export const ConnectionCard = ({ connection, onEdit, onDelete }: ConnectionCardProps) => {
  return (
    <Paper className="flex items-center justify-between rounded-2xl p-4 shadow-sm">
      <Typography className="font-semibold text-slate-900">{connection.name}</Typography>

      <div>
        <IconButton aria-label="Editar conexão" onClick={() => onEdit(connection)}>
          <EditIcon />
        </IconButton>

        <IconButton
          aria-label="Excluir conexão"
          color="error"
          onClick={() => onDelete(connection)}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </Paper>
  );
};