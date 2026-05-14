import { Box, Button, Paper, Typography } from "@mui/material";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <Paper className="rounded-2xl border border-dashed border-slate-300 p-8 text-center shadow-sm">
      <Box className="mx-auto max-w-md">
        <Typography variant="h6" className="font-semibold text-slate-900">
          {title}
        </Typography>
        <Typography className="mt-2 text-slate-500">{description}</Typography>

        {actionLabel && onAction && (
          <Button variant="contained" className="mt-5" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Box>
    </Paper>
  );
};
