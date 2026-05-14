import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserAccountDialog } from "../../features/auth/components/UserAccountDialog";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { AppLogo } from "../components/AppLogo";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const menuItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Conexões", href: "/connections" },
  { label: "Contatos", href: "/contacts" },
  { label: "Mensagens", href: "/messages" },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { pathname } = useLocation();
  const { logout, profile } = useAuth();

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountProfile, setAccountProfile] = useState(profile);

  useEffect(() => {
    setAccountProfile(profile);
  }, [profile]);

  return (
    <Box className="min-h-screen bg-slate-50">
      <AppBar position="sticky" color="inherit" elevation={0} className="border-b border-slate-200">
        <Toolbar className="gap-4">
          <AppLogo />

          <Box className="ml-auto hidden gap-1 md:flex">
            {menuItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Button
                  key={item.href}
                  component={Link}
                  to={item.href}
                  variant={active ? "contained" : "text"}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Box className="ml-auto text-right md:ml-4">
            <Typography className="text-sm font-semibold text-slate-900">
              {accountProfile?.name || "Usuário"}
            </Typography>

            <Box className="flex justify-end gap-1">
              <Button size="small" onClick={() => setAccountDialogOpen(true)}>
                Minha conta
              </Button>

              <Button size="small" onClick={logout}>
                Sair
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="py-8">
        <Box className="mb-6 flex gap-2 overflow-x-auto md:hidden">
          {menuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Button
                key={item.href}
                component={Link}
                to={item.href}
                variant={active ? "contained" : "outlined"}
                size="small"
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {children}
      </Container>

      <UserAccountDialog
        open={accountDialogOpen}
        profile={accountProfile}
        onClose={() => setAccountDialogOpen(false)}
        onSaved={(updatedProfile) => {
          setAccountProfile(updatedProfile);
        }}
      />
    </Box>
  );
};