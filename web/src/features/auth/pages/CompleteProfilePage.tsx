import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FormPhoneField } from "../../../shared/components/FormPhoneField";
import { FormTextField } from "../../../shared/components/FormTextField";
import { useSnackbar } from "../../../shared/hooks/useSnackbar";
import { useAuth } from "../hooks/useAuth";
import {
  completeProfileSchema,
  type CompleteProfileFormData,
} from "../schemas/complete-profile.schema";

const getFriendlyProfileErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) {
    return "Não foi possível salvar seu perfil.";
  }

  const errorWithCode = error as Error & {
    code?: string;
  };

  if (
    error.message.includes("Este e-mail já está cadastrado") ||
    error.message.includes("email já está cadastrado")
  ) {
    return "Este e-mail já está cadastrado em outra conta.";
  }

  if (
    error.message.includes("Este telefone já está cadastrado") ||
    error.message.includes("telefone já está cadastrado")
  ) {
    return "Este telefone já está cadastrado em outra conta.";
  }

  if (errorWithCode.code === "functions/already-exists") {
    return "Este e-mail ou telefone já está cadastrado em outra conta.";
  }

  if (errorWithCode.code === "functions/invalid-argument") {
    return error.message || "Confira os dados informados.";
  }

  if (errorWithCode.code === "functions/unauthenticated") {
    return "Sua sessão expirou. Faça login novamente.";
  }

  return error.message || "Não foi possível salvar seu perfil.";
};

export const CompleteProfilePage = () => {
  const { profile, completeProfile } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const { control, handleSubmit, reset, formState } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        companyName: profile.companyName ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: CompleteProfileFormData) => {
    try {
      await completeProfile(data);
      showSnackbar("Perfil completado com sucesso.", "success");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      showSnackbar(getFriendlyProfileErrorMessage(error), "error");
    }
  };

  return (
    <Box className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Paper className="w-full max-w-2xl rounded-3xl p-6 shadow-lg">
        <Typography variant="h5" className="font-bold text-slate-900">
          Complete seu perfil
        </Typography>
        <Typography className="mt-1 text-slate-500">
          Precisamos desses dados para ativar sua área SaaS com segurança.
        </Typography>

        <Box
          component="form"
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormTextField<CompleteProfileFormData>
            control={control}
            name="name"
            label="Nome completo"
          />

          <FormTextField<CompleteProfileFormData>
            control={control}
            name="email"
            label="E-mail"
            type="email"
          />

          <FormPhoneField<CompleteProfileFormData>
            control={control}
            name="phone"
            label="Telefone"
          />

          <FormTextField<CompleteProfileFormData>
            control={control}
            name="companyName"
            label="Nome da empresa"
          />

          <Box className="md:col-span-2">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? "Salvando..." : "Salvar e continuar"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};