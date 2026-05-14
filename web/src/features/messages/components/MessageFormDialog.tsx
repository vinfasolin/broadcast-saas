import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FormTextField } from "../../../shared/components/FormTextField";
import type { Connection } from "../../connections/types/connection.types";
import type { Contact } from "../../contacts/types/contact.types";
import { messageSchema, type MessageFormData } from "../schemas/message.schema";
import type { BroadcastMessage } from "../types/message.types";
import { ContactSelector } from "./ContactSelector";
import { ScheduleFields } from "./ScheduleFields";

type MessageFormDialogProps = {
  open: boolean;
  loading?: boolean;
  message?: BroadcastMessage | null;
  connections: Connection[];
  contacts: Contact[];
  onClose: () => void;
  onSubmit: (data: MessageFormData) => Promise<void>;
};

const formatTimestampToDateTimeLocal = (
  scheduledAt: BroadcastMessage["scheduledAt"]
) => {
  if (!scheduledAt) {
    return "";
  }

  const date = scheduledAt.toDate();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 16);
};

export const MessageFormDialog = ({
  open,
  loading = false,
  message,
  connections,
  contacts,
  onClose,
  onSubmit,
}: MessageFormDialogProps) => {
  const { control, handleSubmit, reset, setValue, watch } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      connectionId: "",
      contactIds: [],
      content: "",
      status: "sent",
      scheduledAt: "",
      sendEmailCopy: false,
      sendWhatsappCopy: false,
    },
  });

  const status = watch("status");

  const selectedConnectionId = useWatch({
    control,
    name: "connectionId",
  });

  const selectedContactIds = useWatch({
    control,
    name: "contactIds",
  });

  useEffect(() => {
    reset({
      connectionId: message?.connectionId ?? connections[0]?.id ?? "",
      contactIds: message?.contactIds ?? [],
      content: message?.content ?? "",
      status: message?.status ?? "sent",
      scheduledAt: formatTimestampToDateTimeLocal(message?.scheduledAt ?? null),
      sendEmailCopy: message?.sendEmailCopy ?? false,
      sendWhatsappCopy: message?.sendWhatsappCopy ?? false,
    });
  }, [message, connections, reset, open]);

  useEffect(() => {
    if (!selectedConnectionId || !contacts.length || !selectedContactIds?.length) {
      return;
    }

    const availableContactIds = new Set(
      contacts
        .filter((contact) => contact.connectionId === selectedConnectionId)
        .map((contact) => contact.id)
    );

    const nextContactIds = selectedContactIds.filter((contactId) =>
      availableContactIds.has(contactId)
    );

    if (nextContactIds.length !== selectedContactIds.length) {
      setValue("contactIds", nextContactIds, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [contacts, selectedConnectionId, selectedContactIds, setValue]);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{message ? "Editar mensagem" : "Nova mensagem"}</DialogTitle>

      <DialogContent className="space-y-4 pt-3">
        <FormTextField<MessageFormData> control={control} name="connectionId" label="Conexão" select>
          {connections.map((connection) => (
            <MenuItem key={connection.id} value={connection.id}>
              {connection.name}
            </MenuItem>
          ))}
        </FormTextField>

        <Controller
          control={control}
          name="contactIds"
          render={({ field, fieldState }) => (
            <>
              <ContactSelector
                contacts={contacts}
                value={field.value ?? []}
                connectionId={selectedConnectionId}
                onChange={field.onChange}
              />

              {fieldState.error && (
                <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
              )}
            </>
          )}
        />

        <FormTextField<MessageFormData>
          control={control}
          name="content"
          label="Mensagem"
          multiline
          minRows={4}
        />

        <FormTextField<MessageFormData> control={control} name="status" label="Status" select>
          <MenuItem value="sent">Enviar agora</MenuItem>
          <MenuItem value="scheduled">Agendar</MenuItem>
        </FormTextField>

        {status === "scheduled" && <ScheduleFields control={control} />}

        <Controller
          control={control}
          name="sendWhatsappCopy"
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.value)}
                  onChange={(_, checked) => field.onChange(checked)}
                />
              }
              label="Plus: enviar mensagem real por WhatsApp (Baileys) para contatos com telefone cadastrado"
            />
          )}
        />

        <Controller
          control={control}
          name="sendEmailCopy"
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.value)}
                  onChange={(_, checked) => field.onChange(checked)}
                />
              }
              label="Plus: enviar cópia real por e-mail para contatos com e-mail cadastrado"
            />
          )}
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