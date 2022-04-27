import { MuiTextFieldProps } from "@mui/x-date-pickers/internals/components/PureDateInput";
import dayjs from "dayjs";

export interface DateTimeInputProps {
  dateTime: dayjs.Dayjs | null;
  label: MuiTextFieldProps["label"];
  onChange: (
    date: dayjs.Dayjs | null,
    keyboardInputValue?: string | undefined
  ) => void;
}
