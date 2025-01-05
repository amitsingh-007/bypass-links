import { style } from '@vanilla-extract/css';
import { vars } from '../../constants/theme.css';

export const containerClass = style({
  borderBottom: `1px solid ${vars.colors.dark[5]}`,

  '@media': {
    [vars.largerThan('md')]: {
      border: `1px solid ${vars.colors.dark[5]}`,
      borderBottomLeftRadius: '6px',
      borderBottomRightRadius: '6px',
    },
  },
});

export const badgeClass = style({
  '@media': {
    [vars.smallerThan('sm')]: {
      display: 'none !important',
    },
  },
});
