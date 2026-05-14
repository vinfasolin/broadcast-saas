import { Autocomplete, Checkbox, TextField } from "@mui/material";
import type { Contact } from "../../contacts/types/contact.types";

type ContactSelectorProps = {
  contacts: Contact[];
  value: string[];
  onChange: (contactIds: string[]) => void;
  connectionId?: string;
};

export const ContactSelector = ({
  contacts,
  value,
  onChange,
  connectionId,
}: ContactSelectorProps) => {
  const availableContacts = connectionId
    ? contacts.filter((contact) => contact.connectionId === connectionId)
    : contacts;

  const selectedContacts = availableContacts.filter((contact) => value.includes(contact.id));

  return (
    <Autocomplete
      multiple
      options={availableContacts}
      value={selectedContacts}
      disableCloseOnSelect
      getOptionLabel={(option) => `${option.name} - ${option.phone}`}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      noOptionsText={
        connectionId
          ? "Nenhum contato encontrado para esta conexão."
          : "Selecione uma conexão para listar os contatos."
      }
      onChange={(_, nextContacts) => onChange(nextContacts.map((contact) => contact.id))}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox checked={selected} />
          {option.name} - {option.phone}
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label="Contatos" placeholder="Selecione contatos" />
      )}
    />
  );
};