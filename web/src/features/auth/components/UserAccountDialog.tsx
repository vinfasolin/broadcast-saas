import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  type FieldErrors,
  useForm,
} from "react-hook-form";
import { auth } from "../../../config/firebase";
import { FormTextField } from "../../../shared/components/FormTextField";
import {
  logoutFromFirebase,
  updateCurrentUserDisplayName,
  updateCurrentUserEmail,
  updateCurrentUserPassword,
} from "../services/auth.service";
import { deleteUserAccount, updateUserProfile } from "../services/profile.service";
import {
  userAccountSchema,
  type UserAccountFormData,
} from "../schemas/user-account.schema";
import type { UserProfile } from "../types/auth.types";

type UserAccountDialogProps = {
  open: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSaved?: (profile: UserProfile) => void | Promise<void>;
};

type FeedbackSeverity = "success" | "error" | "warning" | "info";

type FeedbackDialogState = {
  open: boolean;
  severity: FeedbackSeverity;
  title: string;
  message: string;
  fieldName?: keyof UserAccountFormData;
};

type FriendlyFeedback = {
  title: string;
  message: string;
  fieldName?: keyof UserAccountFormData;
};

const normalizeText = (value?: string | null) => value?.trim() ?? "";

const normalizeEmail = (value?: string | null) => normalizeText(value).toLowerCase();

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const fieldLabels: Record<keyof UserAccountFormData, string> = {
  name: "Nome",
  email: "E-mail",
  phone: "Telefone",
  companyName: "Empresa",
  currentPassword: "Senha atual",
  newPassword: "Nova senha",
  confirmNewPassword: "Confirmar nova senha",
};

const fieldOrder: Array<keyof UserAccountFormData> = [
  "name",
  "email",
  "phone",
  "companyName",
  "currentPassword",
  "newPassword",
  "confirmNewPassword",
];

const formatBrazilPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const scrollToField = (fieldName?: keyof UserAccountFormData) => {
  if (!fieldName) {
    return;
  }

  window.requestAnimationFrame(() => {
    const fieldElement = document.querySelector<HTMLElement>(`[name="${fieldName}"]`);

    if (!fieldElement) {
      return;
    }

    fieldElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    window.setTimeout(() => {
      fieldElement.focus();
    }, 350);
  });
};

const getFirstInvalidFieldName = (
  errors: FieldErrors<UserAccountFormData>
): keyof UserAccountFormData | undefined => {
  return fieldOrder.find((fieldName) => Boolean(errors[fieldName]));
};

const getInvalidFieldMessage = (
  errors: FieldErrors<UserAccountFormData>,
  fieldName?: keyof UserAccountFormData
) => {
  if (!fieldName) {
    return "Confira os dados informados e tente novamente.";
  }

  const fieldError = errors[fieldName];
  const message = fieldError?.message;

  if (typeof message === "string" && message) {
    return message;
  }

  return `Confira o campo ${fieldLabels[fieldName]}.`;
};

const getFriendlyErrorFeedback = (error: unknown): FriendlyFeedback => {
  if (!(error instanceof Error)) {
    return {
      title: "Não foi possível salvar",
      message: "Não foi possível salvar os dados da conta.",
    };
  }

  const errorWithCode = error as Error & {
    code?: string;
  };

  if (
    error.message.includes("Este e-mail já está cadastrado") ||
    error.message.includes("email já está cadastrado") ||
    error.message.includes("e-mail já está cadastrado")
  ) {
    return {
      title: "E-mail já cadastrado",
      message: "Este e-mail já está cadastrado em outra conta.",
      fieldName: "email",
    };
  }

  if (
    error.message.includes("Este telefone já está cadastrado") ||
    error.message.includes("telefone já está cadastrado")
  ) {
    return {
      title: "Telefone já cadastrado",
      message: "Este telefone já está cadastrado em outra conta.",
      fieldName: "phone",
    };
  }

  if (errorWithCode.code === "functions/already-exists") {
    return {
      title: "Dados já cadastrados",
      message: "Este e-mail ou telefone já está cadastrado em outra conta.",
      fieldName: "email",
    };
  }

  if (errorWithCode.code === "functions/invalid-argument") {
    return {
      title: "Confira os dados",
      message: error.message || "Confira os dados informados.",
    };
  }

  if (errorWithCode.code === "functions/unauthenticated") {
    return {
      title: "Sessão expirada",
      message: "Sua sessão expirou. Faça login novamente.",
    };
  }

  if (error.message.includes("auth/email-already-in-use")) {
    return {
      title: "E-mail já usado",
      message: "Este e-mail já está sendo usado por outra conta.",
      fieldName: "email",
    };
  }

  if (error.message.includes("auth/invalid-email")) {
    return {
      title: "E-mail inválido",
      message: "Informe um e-mail válido.",
      fieldName: "email",
    };
  }

  if (error.message.includes("auth/wrong-password")) {
    return {
      title: "Senha incorreta",
      message: "A senha atual está incorreta.",
      fieldName: "currentPassword",
    };
  }

  if (error.message.includes("auth/invalid-credential")) {
    return {
      title: "Confirmação necessária",
      message: "Não foi possível confirmar sua identidade. Verifique sua senha atual.",
      fieldName: "currentPassword",
    };
  }

  if (error.message.includes("auth/requires-recent-login")) {
    return {
      title: "Faça login novamente",
      message: "Por segurança, faça login novamente antes de alterar e-mail ou senha.",
      fieldName: "currentPassword",
    };
  }

  if (error.message.includes("auth/weak-password")) {
    return {
      title: "Senha fraca",
      message: "A nova senha é muito fraca. Use pelo menos 6 caracteres.",
      fieldName: "newPassword",
    };
  }

  if (error.message.includes("auth/popup-closed-by-user")) {
    return {
      title: "Confirmação cancelada",
      message: "A confirmação foi cancelada.",
    };
  }

  return {
    title: "Não foi possível salvar",
    message: error.message || "Não foi possível salvar os dados da conta.",
  };
};

const getFriendlyDeleteErrorFeedback = (error: unknown): FriendlyFeedback => {
  if (!(error instanceof Error)) {
    return {
      title: "Não foi possível excluir",
      message: "Não foi possível excluir sua conta agora.",
    };
  }

  const errorWithCode = error as Error & {
    code?: string;
  };

  if (errorWithCode.code === "functions/unauthenticated") {
    return {
      title: "Sessão expirada",
      message: "Sua sessão expirou. Faça login novamente antes de excluir a conta.",
    };
  }

  if (errorWithCode.code === "functions/internal") {
    return {
      title: "Não foi possível excluir",
      message: "Não foi possível excluir sua conta agora. Tente novamente em alguns instantes.",
    };
  }

  return {
    title: "Não foi possível excluir",
    message: error.message || "Não foi possível excluir sua conta agora.",
  };
};

export const UserAccountDialog = ({
  open,
  profile,
  onClose,
  onSaved,
}: UserAccountDialogProps) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState<FeedbackDialogState>({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const currentUser = auth.currentUser;

  const canChangeEmailAndPasswordInAuth = useMemo(() => {
    return Boolean(
      currentUser?.providerData.some((provider) => provider.providerId === "password")
    );
  }, [currentUser]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UserAccountFormData>({
    resolver: zodResolver(userAccountSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setDeleteConfirmOpen(false);
    setIsDeleting(false);
    setFeedbackDialog({
      open: false,
      severity: "info",
      title: "",
      message: "",
    });

    reset({
      name: normalizeText(profile?.name || currentUser?.displayName),
      email: normalizeEmail(profile?.email || currentUser?.email),
      phone: formatBrazilPhone(normalizeText(profile?.phone || currentUser?.phoneNumber)),
      companyName: normalizeText(profile?.companyName),
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  }, [open, profile, currentUser, reset]);

  const openFeedbackDialog = (
    severity: FeedbackSeverity,
    title: string,
    message: string,
    fieldName?: keyof UserAccountFormData
  ) => {
    scrollToField(fieldName);

    setFeedbackDialog({
      open: true,
      severity,
      title,
      message,
      fieldName,
    });
  };

  const closeFeedbackDialog = () => {
    const relatedFieldName = feedbackDialog.fieldName;

    setFeedbackDialog((current) => ({
      ...current,
      open: false,
    }));

    scrollToField(relatedFieldName);
  };

  const handleInvalidSubmit = (errors: FieldErrors<UserAccountFormData>) => {
    const fieldName = getFirstInvalidFieldName(errors);
    const message = getInvalidFieldMessage(errors, fieldName);

    openFeedbackDialog(
      "error",
      fieldName ? `Revise o campo ${fieldLabels[fieldName]}` : "Revise os dados",
      message,
      fieldName
    );
  };

  const submitForm = async (data: UserAccountFormData) => {
    const user = auth.currentUser;

    if (!user) {
      openFeedbackDialog(
        "error",
        "Usuário não autenticado",
        "Faça login novamente para salvar os dados da conta."
      );
      return;
    }

    try {
      const nextName = normalizeText(data.name);
      const nextEmail = normalizeEmail(data.email);
      const nextPhone = formatBrazilPhone(data.phone);
      const nextCompanyName = normalizeText(data.companyName);
      const currentPassword = normalizeText(data.currentPassword);
      const newPassword = normalizeText(data.newPassword);
      const currentAuthEmail = normalizeEmail(user.email);

      await updateCurrentUserDisplayName(nextName);

      if (
        canChangeEmailAndPasswordInAuth &&
        currentAuthEmail &&
        nextEmail &&
        nextEmail !== currentAuthEmail
      ) {
        await updateCurrentUserEmail(nextEmail, currentPassword || undefined);
      }

      if (canChangeEmailAndPasswordInAuth && newPassword) {
        await updateCurrentUserPassword(currentPassword, newPassword);
      }

      const updatedProfile = await updateUserProfile(user.uid, {
        name: nextName,
        email: nextEmail,
        phone: nextPhone,
        companyName: nextCompanyName,
      });

      await onSaved?.(updatedProfile);

      reset({
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: formatBrazilPhone(updatedProfile.phone),
        companyName: updatedProfile.companyName,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      openFeedbackDialog(
        "success",
        "Dados salvos",
        "Dados da conta atualizados com sucesso."
      );
    } catch (error) {
      const feedback = getFriendlyErrorFeedback(error);

      openFeedbackDialog(
        "error",
        feedback.title,
        feedback.message,
        feedback.fieldName
      );
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      await deleteUserAccount();

      try {
        await logoutFromFirebase();
      } finally {
        window.location.replace("/");
      }
    } catch (error) {
      const feedback = getFriendlyDeleteErrorFeedback(error);

      setDeleteConfirmOpen(false);

      openFeedbackDialog(
        "error",
        feedback.title,
        feedback.message,
        feedback.fieldName
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={isSubmitting || isDeleting ? undefined : onClose}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSubmit(submitForm, handleInvalidSubmit)}>
          <DialogTitle>Minha conta</DialogTitle>

          <DialogContent>
            <Stack spacing={2} className="pt-2">
              <Typography variant="body2" color="text.secondary">
                Atualize seus dados de acesso e informações do perfil.
              </Typography>

              <FormTextField<UserAccountFormData>
                control={control}
                name="name"
                label="Nome"
                autoComplete="name"
              />

              <FormTextField<UserAccountFormData>
                control={control}
                name="email"
                label="E-mail do perfil"
                type="email"
                autoComplete="email"
                helperText={
                  canChangeEmailAndPasswordInAuth
                    ? "Para alterar o e-mail de acesso, informe sua senha atual."
                    : "Este e-mail será usado como informação de perfil."
                }
              />

              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(formatBrazilPhone(event.target.value))}
                    label="Telefone"
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    fullWidth
                    sx={{ my: 1 }}
                  />
                )}
              />

              <FormTextField<UserAccountFormData>
                control={control}
                name="companyName"
                label="Empresa"
                autoComplete="organization"
              />

              <Divider />

              <Box>
                <Typography variant="subtitle2" className="mb-1">
                  Segurança
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {canChangeEmailAndPasswordInAuth
                    ? "Para alterar e-mail de acesso ou senha, informe sua senha atual."
                    : "Sua conta foi criada com Google ou telefone. A senha não é alterada por aqui."}
                </Typography>
              </Box>

              <FormTextField<UserAccountFormData>
                control={control}
                name="currentPassword"
                label="Senha atual"
                type="password"
                autoComplete="current-password"
                disabled={!canChangeEmailAndPasswordInAuth}
                helperText={
                  canChangeEmailAndPasswordInAuth
                    ? "Obrigatória apenas para alterar e-mail de acesso ou senha."
                    : "Disponível apenas para contas com e-mail e senha."
                }
              />

              <FormTextField<UserAccountFormData>
                control={control}
                name="newPassword"
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                disabled={!canChangeEmailAndPasswordInAuth}
                helperText={
                  canChangeEmailAndPasswordInAuth
                    ? "Preencha apenas se quiser alterar sua senha."
                    : "Alteração de senha disponível apenas para login com e-mail e senha."
                }
              />

              <FormTextField<UserAccountFormData>
                control={control}
                name="confirmNewPassword"
                label="Confirmar nova senha"
                type="password"
                autoComplete="new-password"
                disabled={!canChangeEmailAndPasswordInAuth}
              />

              <Divider />

              <Box>
                <Typography variant="subtitle2" className="mb-1 text-red-700">
                  Zona de perigo
                </Typography>

                <Typography variant="body2" color="text.secondary" className="mb-3">
                  Excluir sua conta remove seu usuário e todos os dados vinculados a ele.
                </Typography>

                <Button
                  type="button"
                  color="error"
                  variant="outlined"
                  disabled={isSubmitting || isDeleting}
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  Excluir minha conta
                </Button>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button disabled={isSubmitting || isDeleting} onClick={onClose}>
              Fechar
            </Button>

            <Button
              disabled={isSubmitting || isDeleting}
              type="submit"
              variant="contained"
            >
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={feedbackDialog.open}
        onClose={closeFeedbackDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{feedbackDialog.title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} className="pt-2">
            <Alert severity={feedbackDialog.severity}>
              {feedbackDialog.message}
            </Alert>

            {feedbackDialog.fieldName && (
              <Typography variant="body2" color="text.secondary">
                Campo relacionado: <strong>{fieldLabels[feedbackDialog.fieldName]}</strong>.
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={closeFeedbackDialog}>
            Entendi
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={isDeleting ? undefined : () => setDeleteConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Excluir conta?</DialogTitle>

        <DialogContent>
          <Stack spacing={2} className="pt-2">
            <Alert severity="warning">
              Esta ação é permanente e não poderá ser desfeita.
            </Alert>

            <Typography variant="body2" color="text.secondary">
              Ao confirmar, sua conta será excluída junto com seus dados de perfil,
              conexões, contatos, mensagens e reservas de e-mail/telefone.
            </Typography>

            <Typography variant="body2" className="font-semibold text-slate-900">
              Tem certeza que deseja continuar?
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button disabled={isDeleting} onClick={() => setDeleteConfirmOpen(false)}>
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            disabled={isDeleting}
            onClick={handleDeleteAccount}
          >
            {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};