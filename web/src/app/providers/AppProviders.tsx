import { CssBaseline, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "../../shared/hooks/useSnackbar";
import { AuthProvider } from "./AuthProvider";
import { theme } from "../theme";

type AppProvidersProps = {
  children: React.ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <AuthProvider>{children}</AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};
