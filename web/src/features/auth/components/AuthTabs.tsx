import { Box, Tab, Tabs } from "@mui/material";

export type AuthTabValue = "email" | "google" | "phone";

type AuthTabsProps = {
  value: AuthTabValue;
  onChange: (value: AuthTabValue) => void;
};

export const AuthTabs = ({ value, onChange }: AuthTabsProps) => {
  return (
    <Box className="mb-5">
      <Tabs
        value={value}
        onChange={(_, nextValue) => onChange(nextValue)}
        variant="fullWidth"
      >
        <Tab label="E-mail" value="email" />
        <Tab label="Google" value="google" />
        <Tab label="Telefone" value="phone" />
      </Tabs>
    </Box>
  );
};
