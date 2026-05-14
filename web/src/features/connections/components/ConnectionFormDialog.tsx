import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormTextField } from "../../../shared/components/FormTextField";
import { connectionSchema, type ConnectionFormData } from "../schemas/connection.schema";
import type { Connection } from "../types/connection.types";

type ConnectionFormDialogProps = {
  open: boolean;
  loading?: boolean;
  connection?: Connection | null;
  onClose: () => void;
  onSubmit: (data: ConnectionFormData) => Promise<void>;
};

export const ConnectionFormDialog = ({
  open,
  loading = false,
  connection,
  onClose,
  onSubmit,
}: ConnectionFormDialogProps) => {
  const { control, handleSubmit, reset } = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    reset({
      name: connection?.name ?? "",
    });
  }, [connection, reset, open]);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{connection ? "Editar conexão" : "Nova conexão"}</DialogTitle>

      <DialogContent className="pt-3">
        <FormTextField<ConnectionFormData>
          control={control}
          name="name"
          label="Nome da conexão"
          autoFocus
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
