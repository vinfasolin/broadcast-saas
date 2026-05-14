import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  description,
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={onClose}>
          Cancelar
        </Button>
        <Button disabled={loading} color="error" variant="contained" onClick={onConfirm}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
