import { ParseableDate } from "@mui/lab/internal/pickers/constants/prop-types";
import { MuiTextFieldProps } from "@mui/lab/internal/pickers/PureDateInput";
import dayjs from "dayjs";

export interface DateTimeInputProps {
  dateTime: ParseableDate<dayjs.Dayjs>;
  label: MuiTextFieldProps["label"];
  onChange: (
    date: dayjs.Dayjs | null,
    keyboardInputValue?: string | undefined
  ) => void;
}
