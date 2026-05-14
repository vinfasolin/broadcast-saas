import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Paper, Typography } from "@mui/material";
import type { Connection } from "../../connections/types/connection.types";
import type { Contact } from "../types/contact.types";

type ContactCardProps = {
  contact: Contact;
  connection?: Connection;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
};

export const ContactCard = ({ contact, connection, onEdit, onDelete }: ContactCardProps) => {
  return (
    <Paper className="flex items-center justify-between rounded-2xl p-4 shadow-sm">
      <div>
        <Typography className="font-semibold text-slate-900">{contact.name}</Typography>

        <Typography className="text-sm text-slate-500">{contact.phone}</Typography>

        {contact.email && (
          <Typography className="text-sm text-slate-500">{contact.email}</Typography>
        )}

        {connection && (
          <Typography className="mt-1 text-xs font-medium text-blue-600">
            {connection.name}
          </Typography>
        )}
      </div>

      <div>
        <IconButton aria-label="Editar contato" onClick={() => onEdit(contact)}>
          <EditIcon />
        </IconButton>

        <IconButton
          aria-label="Excluir contato"
          color="error"
          onClick={() => onDelete(contact)}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </Paper>
  );
};