import type { PropertyValue } from 'csstype';

type CustomPropertyValue = PropertyValue<string | number> | undefined;

declare module 'csstype' {
  interface Properties {
    [property: `--${string}`]: CustomPropertyValue;
  }
}
