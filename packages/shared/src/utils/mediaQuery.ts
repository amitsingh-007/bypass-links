import { MantineTheme } from '@mantine/core';
import { CSSObject } from '@mantine/styles/lib/tss/types/css-object';
import { ObjectValues } from '../interfaces/utilityTypes';

/**
 * First value of array is mobile style followed by desktop style
 */
type IStyles = {
  [K in keyof CSSObject]: [ObjectValues<CSSObject>, ObjectValues<CSSObject>];
};

export const getMediaQuery = (
  theme: MantineTheme,
  styleObj: IStyles
): CSSObject => {
  return Object.entries(styleObj).reduce<Record<string, any>>(
    (responsiveStyle, [key, value]) => {
      const [mobileStyle, desktopStyle] = value;
      const mediaQueryKey = theme.fn.smallerThan('sm');
      responsiveStyle[key] = desktopStyle;
      let mediaQueryObj = responsiveStyle[mediaQueryKey] ?? {};
      mediaQueryObj = { ...mediaQueryObj, [key]: mobileStyle };
      responsiveStyle[mediaQueryKey] = mediaQueryObj;
      return responsiveStyle;
    },
    {}
  ) satisfies CSSObject;
};
