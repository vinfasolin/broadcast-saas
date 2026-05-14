import { Box, Button, Divider, Typography } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../../../shared/layouts/AuthLayout";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import { useAuth } from "../hooks/useAuth";
import { AuthTabs, type AuthTabValue } from "../components/AuthTabs";
import { EmailPasswordForm } from "../components/EmailPasswordForm";
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import { PhoneLoginForm } from "../components/PhoneLoginForm";
import type { LoginFormData } from "../schemas/login.schema";

export const LoginPage = () => {
  const [tab, setTab] = useState<AuthTabValue>("email");
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const {
    loginWithEmail,
    loginWithGoogleProvider,
    startPhoneAuthentication,
    confirmPhoneAuthentication,
  } = useAuth();

  const runAction = async (action: () => Promise<void>) => {
    setLoading(true);

    try {
      await action();
    } catch (error) {
      console.error(error);
      showSnackbar("Não foi possível concluir o login.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = (data: LoginFormData) => {
    return runAction(() => loginWithEmail(data.email, data.password));
  };

  return (
    <AuthLayout>
      <Typography variant="h5" className="mb-1 font-bold text-slate-900">
        Entrar
      </Typography>
      <Typography className="mb-6 text-slate-500">
        Acesse sua área SaaS de broadcast.
      </Typography>

      <AuthTabs value={tab} onChange={setTab} />

      {tab === "email" && (
        <EmailPasswordForm
          loading={loading}
          submitLabel="Entrar"
          onSubmit={handleEmailLogin}
        />
      )}

      {tab === "google" && (
        <GoogleLoginButton
          loading={loading}
          onClick={() => runAction(loginWithGoogleProvider)}
        />
      )}

      {tab === "phone" && (
        <PhoneLoginForm
          loading={loading}
          onStart={(phone) => runAction(() => startPhoneAuthentication(phone))}
          onConfirm={(code) => runAction(() => confirmPhoneAuthentication(code))}
        />
      )}

      <Divider className="my-6" />

      <Box className="text-center">
        <Typography className="text-sm text-slate-500">Ainda não tem conta?</Typography>
        <Button component={Link} to="/register">
          Criar cadastro
        </Button>
      </Box>
    </AuthLayout>
  );
};
