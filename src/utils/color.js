import { COLOR } from "GlobalConstants/color";

export const getOnIconColor = (isActive) =>
  isActive ? COLOR.green.color : undefined;

export const getOffIconColor = (isActive) =>
  !isActive ? COLOR.red.color : undefined;
