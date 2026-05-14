import { Box } from "@mui/material";
import { EmptyState } from "../../../shared/components/EmptyState";
import type { Connection } from "../../connections/types/connection.types";
import { ContactCard } from "./ContactCard";
import type { Contact } from "../types/contact.types";

type ContactListProps = {
  contacts: Contact[];
  connections: Connection[];
  onCreate: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
};

export const ContactList = ({
  contacts,
  connections,
  onCreate,
  onEdit,
  onDelete,
}: ContactListProps) => {
  if (contacts.length === 0) {
    return (
      <EmptyState
        title="Nenhum contato cadastrado"
        description="Cadastre contatos para selecionar no envio das mensagens."
        actionLabel="Novo contato"
        onAction={onCreate}
      />
    );
  }

  return (
    <Box className="grid gap-3">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          connection={connections.find((item) => item.id === contact.connectionId)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
};
