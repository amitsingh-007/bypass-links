import { Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';

export const BlackTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

export const CircularTooltip = styled(BlackTooltip)(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    borderRadius: '50%',
    padding: '4px',
  },
}));
