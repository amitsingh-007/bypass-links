import { DATE_OPTIONS, TIME_OPTIONS } from "../constants";

export const getCurFormattedDateTime = (date) =>
  `${date.toLocaleString("en-GB", DATE_OPTIONS)} ${date.toLocaleTimeString(
    "en-US",
    TIME_OPTIONS
  )}`;
