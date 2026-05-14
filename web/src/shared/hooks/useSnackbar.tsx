import { Alert, Snackbar } from "@mui/material";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type SnackbarVariant = "success" | "error" | "info" | "warning";

type SnackbarContextValue = {
  showSnackbar: (message: string, variant?: SnackbarVariant) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

type SnackbarProviderProps = {
  children: React.ReactNode;
};

export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<SnackbarVariant>("info");

  const showSnackbar = useCallback((nextMessage: string, nextVariant: SnackbarVariant = "info") => {
    setMessage(nextMessage);
    setVariant(nextVariant);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}

      <Snackbar
        open={open}
        autoHideDuration={4500}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={variant} variant="filled" onClose={() => setOpen(false)}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error("useSnackbar must be used inside SnackbarProvider");
  }

  return context;
};
