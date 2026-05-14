import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Divider, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormTextField } from "../../../shared/components/FormTextField";
import { AuthLayout } from "../../../shared/layouts/AuthLayout";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import { useAuth } from "../hooks/useAuth";
import { registerSchema, type RegisterFormData } from "../schemas/register.schema";
import { GoogleLoginButton } from "../components/GoogleLoginButton";

export const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const { registerWithEmail, loginWithGoogleProvider } = useAuth();
  const { showSnackbar } = useSnackbar();

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const runAction = async (action: () => Promise<void>) => {
    setLoading(true);

    try {
      await action();
    } catch (error) {
      console.error(error);
      showSnackbar("Não foi possível criar sua conta.", "error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: RegisterFormData) => {
    return runAction(() => registerWithEmail(data.email, data.password));
  };

  return (
    <AuthLayout>
      <Typography variant="h5" className="mb-1 font-bold text-slate-900">
        Criar conta
      </Typography>
      <Typography className="mb-6 text-slate-500">
        Comece a organizar suas conexões, contatos e mensagens.
      </Typography>

      <Box component="form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormTextField<RegisterFormData>
          control={control}
          name="email"
          label="E-mail"
          type="email"
          autoComplete="email"
        />

        <FormTextField<RegisterFormData>
          control={control}
          name="password"
          label="Senha"
          type="password"
          autoComplete="new-password"
        />

        <FormTextField<RegisterFormData>
          control={control}
          name="passwordConfirmation"
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
        />

        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          Criar conta
        </Button>
      </Box>

      <Divider className="my-5" />

      <GoogleLoginButton
        loading={loading}
        onClick={() => runAction(loginWithGoogleProvider)}
      />

      <Divider className="my-6" />

      <Box className="text-center">
        <Typography className="text-sm text-slate-500">Já tem conta?</Typography>
        <Button component={Link} to="/login">
          Entrar
        </Button>
      </Box>
    </AuthLayout>
  );
};
