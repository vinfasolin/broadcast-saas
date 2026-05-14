import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import { FormTextField } from "../../../shared/components/FormTextField";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";

type EmailPasswordFormProps = {
  loading?: boolean;
  submitLabel: string;
  onSubmit: (data: LoginFormData) => Promise<void>;
};

export const EmailPasswordForm = ({
  loading = false,
  submitLabel,
  onSubmit,
}: EmailPasswordFormProps) => {
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Box component="form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormTextField<LoginFormData>
        control={control}
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
      />

      <FormTextField<LoginFormData>
        control={control}
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
      />

      <Button type="submit" variant="contained" fullWidth disabled={loading}>
        {submitLabel}
      </Button>
    </Box>
  );
};
