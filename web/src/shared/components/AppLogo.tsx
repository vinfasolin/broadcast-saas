import CampaignIcon from "@mui/icons-material/Campaign";
import { Box, Typography } from "@mui/material";

export const AppLogo = () => {
  return (
    <Box className="flex items-center gap-2">
      <Box className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
        <CampaignIcon />
      </Box>
      <Box>
        <Typography className="font-bold leading-tight text-slate-900">Broadcast</Typography>
        <Typography className="text-xs leading-tight text-slate-500">SaaS Platform</Typography>
      </Box>
    </Box>
  );
};
