import { Box, LinearProgress, TextField } from '@mui/material';
import { SxProps } from '@mui/system';
import { memo, useState } from 'react';
import { TOTP_LENGTH } from '../constants';

const totpInputStyles = {
  maxWidth: '198px',
  '& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
    {
      display: 'none',
    },
};

const Verify2FA = memo<{
  isShown: boolean;
  handleVerify: (totp: string) => Promise<boolean>;
  containerStyles?: SxProps;
}>(function Verify2FA({ isShown, handleVerify, containerStyles = {} }) {
  const [totp, setTOTP] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isShown) {
    return null;
  }

  const handleTOTPChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const totp = event.target.value?.slice(0, TOTP_LENGTH);
    setTOTP(totp);
    if (totp?.length === TOTP_LENGTH) {
      setIsVerifying(true);
      const isVerified = await handleVerify(totp);
      setIsVerifying(false);
      if (!isVerified) {
        setTOTP('');
      }
    }
  };

  return (
    <>
      <TextField
        required
        autoFocus
        onBlur={({ target }) => target.focus()}
        fullWidth
        size="small"
        type="number"
        color="primary"
        variant="outlined"
        label="Enter TOTP"
        title={totp}
        value={totp}
        onChange={handleTOTPChange}
        sx={{ ...totpInputStyles, ...containerStyles }}
        inputProps={{
          sx: {
            px: '16px',
            letterSpacing: '17px',
            caretColor: 'transparent',
          },
        }}
      />
      {isVerifying && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%' }}>
          <LinearProgress color="secondary" />
        </Box>
      )}
    </>
  );
});

export default Verify2FA;
