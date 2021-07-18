import { COLOR } from "GlobalConstants/color";
import { ValueOf } from "GlobalInterfaces/custom";

export const getOnIconColor = (isActive: boolean) =>
  isActive ? COLOR.green.color : undefined;

export const getOffIconColor = (isActive: boolean) =>
  !isActive ? COLOR.red.color : undefined;

export const getActiveDisabledColor = (
  isActive: boolean,
  activeColor: ValueOf<typeof COLOR>
) => (isActive ? activeColor : null) as React.CSSProperties;
