import { FormDateTimeField } from "../../../shared/components/FormDateTimeField";
import type { Control } from "react-hook-form";
import type { MessageFormData } from "../schemas/message.schema";

type ScheduleFieldsProps = {
  control: Control<MessageFormData>;
};

export const ScheduleFields = ({ control }: ScheduleFieldsProps) => {
  return (
    <FormDateTimeField<MessageFormData>
      control={control}
      name="scheduledAt"
      label="Data e hora do envio"
    />
  );
};
