import { ParseableDate } from "@material-ui/lab/internal/pickers/constants/prop-types";
import { MuiTextFieldProps } from "@material-ui/lab/internal/pickers/PureDateInput";

export interface DateTimeInputProps {
  dateTime: ParseableDate<Date>;
  label: MuiTextFieldProps["label"];
  onChange: (
    date: Date | null,
    keyboardInputValue?: string | undefined
  ) => void;
}
