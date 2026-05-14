import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormPhoneField } from "../../../shared/components/FormPhoneField";
import { phoneLoginSchema, type PhoneLoginFormData } from "../schemas/phone-login.schema";

type PhoneLoginFormProps = {
  loading?: boolean;
  onStart: (phone: string) => Promise<void>;
  onConfirm: (code: string) => Promise<void>;
};

export const PhoneLoginForm = ({
  loading = false,
  onStart,
  onConfirm,
}: PhoneLoginFormProps) => {
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [sentPhone, setSentPhone] = useState("");

  const { control, handleSubmit } = useForm<PhoneLoginFormData>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: "",
      code: "",
    },
  });

  const handleStart = async (data: PhoneLoginFormData) => {
    await onStart(data.phone);

    setSentPhone(data.phone);
    setCode("");
    setCodeSent(true);
  };

  const handleConfirm = async () => {
    const normalizedCode = code.trim();

    if (normalizedCode.length < 6) {
      return;
    }

    await onConfirm(normalizedCode);
  };

  return (
    <Box className="space-y-6">
      <Box component="form" className="space-y-5" onSubmit={handleSubmit(handleStart)}>
        <Box>
          <FormPhoneField<PhoneLoginFormData>
            control={control}
            name="phone"
            label="Telefone"
            placeholder="+55 (41) 99999-9999"
            disabled={loading}
          />

          <Typography className="mt-1 text-xs text-slate-500">
            Informe um número real com DDD para receber o código por SMS.
          </Typography>
        </Box>

        <Box
          id="recaptcha-container"
          sx={{
            display: "flex",
            justifyContent: "center",
            minHeight: 78,
            width: "100%",
            mt: 1,
          }}
        />

        <Button type="submit" variant="outlined" fullWidth disabled={loading}>
          {codeSent ? "Reenviar código SMS" : "Enviar código SMS"}
        </Button>
      </Box>

      {codeSent && (
        <Box className="space-y-5">
          <Divider />

          <Box>
            <Typography className="text-sm font-medium text-slate-700">
              Código enviado para:
            </Typography>
            <Typography className="text-sm text-slate-500">{sentPhone}</Typography>
          </Box>

          <TextField
            label="Código de verificação"
            fullWidth
            value={code}
            disabled={loading}
            inputProps={{
              inputMode: "numeric",
              maxLength: 6,
            }}
            onChange={(event) => {
              const onlyNumbers = event.target.value.replace(/\D/g, "");
              setCode(onlyNumbers);
            }}
            helperText="Informe o código de 6 dígitos recebido por SMS."
          />

          <Button
            variant="contained"
            fullWidth
            disabled={loading || code.trim().length < 6}
            onClick={handleConfirm}
          >
            Confirmar código
          </Button>
        </Box>
      )}
    </Box>
  );
};