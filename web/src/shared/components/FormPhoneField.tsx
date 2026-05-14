import { forwardRef } from "react";
import { TextField, type TextFieldProps } from "@mui/material";
import { IMaskInput } from "react-imask";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

type PhoneMaskInputProps = {
  name: string;
  onChange: (event: { target: { name: string; value: string } }) => void;
};

const PhoneMaskInput = forwardRef<HTMLInputElement, PhoneMaskInputProps>(
  function PhoneMaskInput(props, ref) {
    const { onChange, name, ...other } = props;

    return (
      <IMaskInput
        {...other}
        mask="+55 (00) 00000-0000"
        inputRef={ref}
        onAccept={(value) => onChange({ target: { name, value: String(value) } })}
        overwrite
      />
    );
  }
);

type FormPhoneFieldProps<T extends FieldValues> = TextFieldProps & {
  name: Path<T>;
  control: Control<T>;
};

export const FormPhoneField = <T extends FieldValues>({
  name,
  control,
  ...props
}: FormPhoneFieldProps<T>) => {
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
          helperText={fieldState.error?.message ?? props.helperText}
          fullWidth
          InputProps={{
            inputComponent: PhoneMaskInput as never,
          }}
        />
      )}
    />
  );
};
