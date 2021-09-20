import { ParseableDate } from "@mui/lab/internal/pickers/constants/prop-types";
import { MuiTextFieldProps } from "@mui/lab/internal/pickers/PureDateInput";

export interface DateTimeInputProps {
  dateTime: ParseableDate<Date>;
  label: MuiTextFieldProps["label"];
  onChange: (
    date: Date | null,
    keyboardInputValue?: string | undefined
  ) => void;
}
