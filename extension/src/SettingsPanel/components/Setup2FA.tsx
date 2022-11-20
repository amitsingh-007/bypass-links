import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  SvgIcon,
  Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { displayToast } from 'GlobalActionCreators/toast';
import PanelHeading from 'GlobalComponents/PanelHeading';
import { BlackTooltip } from '@common/components/StyledComponents';
import { STORAGE_KEYS } from '@common/constants/storage';
import { BG_COLOR_BLACK, BG_COLOR_DARK } from '@common/constants/color';
import storage from 'GlobalHelpers/chrome/storage';
import { getUserProfile } from 'GlobalHelpers/fetchFromStorage';
import { VoidFunction } from '@common/interfaces/custom';
import { toDataURL } from 'qrcode';
import { forwardRef, memo, useEffect, useState } from 'react';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import { IoHelpCircle } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import { setup2FA, verify2FA } from '../apis/twoFactorAuth';
import Verify2FA from '@common/components/Auth/components/Verify2FA';

const tooltipStyles = { fontSize: '13px' };

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

type Props = {
  isOpen: boolean;
  handleClose: VoidFunction;
};

const Setup2FA = memo(function Setup2FA({ isOpen, handleClose }: Props) {
  const dispatch = useDispatch();
  const [, setSecretKey] = useState('');
  const [qrcodeUrl, setQrcodeUrl] = useState('');
  const [showVerifyToken, setShowVerifyToken] = useState(false);

  const init2FA = async () => {
    const userProfile = await getUserProfile();
    const { otpAuthUrl, secretKey } = await setup2FA(userProfile.uid ?? '');
    const qrcodeUrl = await toDataURL(otpAuthUrl, {
      margin: 2,
      type: 'image/jpeg',
      width: 180,
    });
    setSecretKey(secretKey);
    setQrcodeUrl(qrcodeUrl);
  };

  useEffect(() => {
    init2FA();
  }, []);

  const toggleTokenVerify = () => {
    setShowVerifyToken(!showVerifyToken);
  };

  const handleTOTPVerify = async (totp: string) => {
    const userProfile = await getUserProfile();
    const { isVerified } = await verify2FA(userProfile.uid ?? '', totp);
    if (isVerified) {
      userProfile.is2FAEnabled = true;
      await storage.set({ [STORAGE_KEYS.userProfile]: userProfile });
      handleClose();
    } else {
      dispatch(
        displayToast({
          message: 'Entered TOTP is incorrect',
          severity: 'error',
        })
      );
    }
    return isVerified;
  };

  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ p: '8px', backgroundColor: BG_COLOR_DARK }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<HiOutlineArrowNarrowLeft />}
            onClick={handleClose}
            size="small"
            color="error"
          >
            Back
          </Button>
          <PanelHeading
            containerStyles={{ display: 'inline-flex' }}
            heading="SETUP 2FA"
          />
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: '10px !important',
          backgroundColor: BG_COLOR_BLACK,
        }}
      >
        <Avatar
          src={qrcodeUrl}
          alt="2FA QRCode"
          variant="square"
          sx={{ width: '180px', height: '180px' }}
        />
        {!showVerifyToken && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: '12px',
              position: 'relative',
            }}
          >
            <Button
              size="small"
              color="primary"
              variant="outlined"
              onClick={toggleTokenVerify}
            >
              <strong>Proceed</strong>
            </Button>
            <BlackTooltip
              title={
                <Typography style={tooltipStyles}>
                  Open your authenticator app (Google Authentication, Authy,
                  etc) and scan the QRCode
                </Typography>
              }
              arrow
              disableInteractive
              placement="top"
            >
              <SvgIcon color="info">
                <IoHelpCircle />
              </SvgIcon>
            </BlackTooltip>
          </Box>
        )}
        <Verify2FA
          isShown={showVerifyToken}
          handleVerify={handleTOTPVerify}
          containerStyles={{ mt: '50px' }}
        />
      </DialogContent>
    </Dialog>
  );
});

export default Setup2FA;
