import { vars } from '@app/constants/theme.css';
import { style } from '@vanilla-extract/css';

export const infoContainerClass = style({
  marginTop: '10px',

  '@media': {
    [vars.smallerThan('sm')]: {
      marginTop: '0',
    },
  },
});

export const iconContainerClass = style({
  width: '24px',
  height: '24px',

  '@media': {
    [vars.smallerThan('sm')]: {
      width: '20px',
      height: '20px',
    },
  },
});

export const footerContainerClass = style({
  height: '300px',

  '@media': {
    [vars.smallerThan('sm')]: {
      height: '130px',
    },
  },
});

export const footerBodyClass = style({
  padding: '0 200px',
  bottom: '7%',

  '@media': {
    [vars.smallerThan('sm')]: {
      padding: '0 20px',
      bottom: '0',
    },
  },
});

export const imageClass = style({
  height: 'inherit',
  width: 'inherit',
});
