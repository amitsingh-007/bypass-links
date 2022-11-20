import { Dialog, DialogContent } from '@mui/material';
import { BG_COLOR_BLACK } from '../../../constants/color';
import { authenticate2FA } from '../apis/twoFactorAuth';
import Verify2FA from './Verify2FA';

const TOTPPopup = ({
  userId,
  promptTOTPVerify,
  verifyCallback,
  dialog,
}: {
  userId: string;
  promptTOTPVerify: boolean;
  verifyCallback: (isVerified: boolean) => void;
  dialog?: boolean;
}) => {
  const handleAuthenticateTOTP = async (totp: string) => {
    const { isVerified } = await authenticate2FA(userId, totp);
    verifyCallback(isVerified);
    return isVerified;
  };

  const component = <Verify2FA isShown handleVerify={handleAuthenticateTOTP} />;
  return dialog ? (
    <Dialog fullScreen={dialog} open={promptTOTPVerify}>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: '10px',
          backgroundColor: BG_COLOR_BLACK,
        }}
      >
        {component}
      </DialogContent>
    </Dialog>
  ) : (
    component
  );
};

export default TOTPPopup;
