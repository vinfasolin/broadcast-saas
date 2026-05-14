import { Box, Paper } from "@mui/material";
import { AppLogo } from "../components/AppLogo";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Box className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-white p-4">
      <Paper className="w-full max-w-md rounded-3xl p-6 shadow-xl">
        <Box className="mb-8 flex justify-center">
          <AppLogo />
        </Box>
        {children}
      </Paper>
    </Box>
  );
};
