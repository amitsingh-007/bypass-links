import { ButtonTypeMap } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { memo } from 'react';

const StyledButton = memo<{
  children: React.ReactNode;
  showSuccessColor: boolean;
  isLoading?: boolean;
  isDisabled: boolean;
  onClick: React.MouseEventHandler;
  color?: ButtonTypeMap['props']['color'];
}>(
  ({
    children,
    showSuccessColor,
    isLoading = false,
    isDisabled,
    onClick,
    color = 'secondary',
  }) => {
    return (
      <LoadingButton
        variant="outlined"
        sx={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          minWidth: 'unset',
        }}
        color={showSuccessColor ? color : 'error'}
        loading={isLoading}
        disabled={isDisabled}
        onClick={onClick}
      >
        {children}
      </LoadingButton>
    );
  }
);
StyledButton.displayName = 'StyledButton';

export default StyledButton;
