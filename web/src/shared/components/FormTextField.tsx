import { TextField, type TextFieldProps } from "@mui/material";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

type FormTextFieldProps<T extends FieldValues> = TextFieldProps & {
  name: Path<T>;
  control: Control<T>;
};

export const FormTextField = <T extends FieldValues>({
  name,
  control,
  helperText,
  sx,
  ...props
}: FormTextFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          {...field}
          value={field.value ?? ""}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
          fullWidth
          sx={[
            {
              my: 1,
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        />
      )}
    />
  );
};