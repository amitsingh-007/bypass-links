import { COLOR } from "GlobalConstants/color";

export const getOnIconColor = (isActive: boolean) =>
  isActive ? COLOR.green.color : undefined;

export const getOffIconColor = (isActive: boolean) =>
  !isActive ? COLOR.red.color : undefined;
