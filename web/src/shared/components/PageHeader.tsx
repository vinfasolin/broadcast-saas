import { Box, Button, Typography } from "@mui/material";

type PageHeaderProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const PageHeader = ({ title, description, actionLabel, onAction }: PageHeaderProps) => {
  return (
    <Box className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Box>
        <Typography variant="h4" className="font-bold text-slate-900">
          {title}
        </Typography>
        {description && <Typography className="mt-1 text-slate-500">{description}</Typography>}
      </Box>

      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};
