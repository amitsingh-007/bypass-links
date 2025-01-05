import { globalStyle, style } from '@vanilla-extract/css';

export const headingClass = style({
  userSelect: 'none',
});

export const buttonsContainerClass = style({
  width: '100%',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: '16px 8px',
  marginTop: '16px',
});

globalStyle(`${buttonsContainerClass} > *`, {
  width: '47.5%',
});
