import { MantineTheme } from '@mantine/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CSSObject } from '@mantine/styles/lib/tss/types/css-object';

type valueof<T> = T[keyof T];

/**
 * First value of array is mobile style followed by desktop style
 */
type IStyles = {
  [K in keyof CSSObject]: [valueof<CSSObject>, valueof<CSSObject>];
};

export const getMediaQuery = (theme: MantineTheme, styleObj: IStyles) => {
  return Object.entries(styleObj).reduce<Record<string, any>>(
    (responsiveStyle, [key, value]) => {
      const [mobileStyle, desktopStyle] = value;
      const mediaQueryKey = theme.fn.smallerThan('md');
      responsiveStyle[key] = desktopStyle;
      let mediaQueryObj = responsiveStyle[mediaQueryKey] ?? {};
      mediaQueryObj = { ...mediaQueryObj, [key]: mobileStyle };
      responsiveStyle[mediaQueryKey] = mediaQueryObj;
      return responsiveStyle;
    },
    {}
  ) as CSSObject;
};
