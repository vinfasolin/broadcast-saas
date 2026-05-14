import { TextField, type TextFieldProps } from "@mui/material";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

type FormDateTimeFieldProps<T extends FieldValues> = Omit<TextFieldProps, "type"> & {
  name: Path<T>;
  control: Control<T>;
};

export const FormDateTimeField = <T extends FieldValues>({
  name,
  control,
  ...props
}: FormDateTimeFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          {...field}
          value={field.value ?? ""}
          type="datetime-local"
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? props.helperText}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      )}
    />
  );
};
