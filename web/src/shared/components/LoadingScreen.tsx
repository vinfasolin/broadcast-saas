import { Box, CircularProgress, Typography } from "@mui/material";

export const LoadingScreen = () => {
  return (
    <Box className="flex min-h-screen items-center justify-center bg-slate-50">
      <Box className="text-center">
        <CircularProgress />
        <Typography className="mt-4 text-slate-600">Carregando...</Typography>
      </Box>
    </Box>
  );
};
