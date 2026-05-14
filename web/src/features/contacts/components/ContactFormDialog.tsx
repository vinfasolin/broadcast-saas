import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormPhoneField } from "../../../shared/components/FormPhoneField";
import { FormTextField } from "../../../shared/components/FormTextField";
import type { Connection } from "../../connections/types/connection.types";
import { contactSchema, type ContactFormData } from "../schemas/contact.schema";
import type { Contact } from "../types/contact.types";

type ContactFormDialogProps = {
  open: boolean;
  loading?: boolean;
  contact?: Contact | null;
  connections: Connection[];
  onClose: () => void;
  onSubmit: (data: ContactFormData) => Promise<void>;
};

export const ContactFormDialog = ({
  open,
  loading = false,
  contact,
  connections,
  onClose,
  onSubmit,
}: ContactFormDialogProps) => {
  const { control, handleSubmit, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      connectionId: "",
      name: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    reset({
      connectionId: contact?.connectionId ?? connections[0]?.id ?? "",
      name: contact?.name ?? "",
      phone: contact?.phone ?? "",
      email: contact?.email ?? "",
    });
  }, [contact, connections, reset, open]);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{contact ? "Editar contato" : "Novo contato"}</DialogTitle>

      <DialogContent className="space-y-4 pt-3">
        <FormTextField<ContactFormData> control={control} name="connectionId" label="Conexão" select>
          {connections.map((connection) => (
            <MenuItem key={connection.id} value={connection.id}>
              {connection.name}
            </MenuItem>
          ))}
        </FormTextField>

        <FormTextField<ContactFormData> control={control} name="name" label="Nome" />
        <FormPhoneField<ContactFormData> control={control} name="phone" label="Telefone" />
        <FormTextField<ContactFormData>
          control={control}
          name="email"
          label="E-mail para envio real"
          type="email"
          helperText="Opcional. Usado apenas no plus de envio real por e-mail."
        />
      </DialogContent>

      <DialogActions>
        <Button disabled={loading} onClick={onClose}>
          Cancelar
        </Button>
        <Button disabled={loading} variant="contained" onClick={handleSubmit(onSubmit)}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
