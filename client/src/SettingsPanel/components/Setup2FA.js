import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Typography,
} from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import storage from "ChromeApi/storage";
import { displayToast } from "GlobalActionCreators/index";
import PanelHeading from "GlobalComponents/PanelHeading";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { BG_COLOR_BLACK, BG_COLOR_DARK, COLOR } from "GlobalConstants/color";
import { toDataURL } from "qrcode";
import { forwardRef, memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setup2FA, verify2FA } from "../apis/TwoFactorAuth";
import Verify2FA from "./Verify2FA";

const tooltipStyles = { fontSize: "13px" };

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const Setup2FA = memo(({ isOpen, handleClose }) => {
  const dispatch = useDispatch();
  const [secretKey, setSecretKey] = useState(null);
  const [qrcodeUrl, setQrcodeUrl] = useState(null);
  const [showVerifyToken, setShowVerifyToken] = useState(false);

  const init2FA = async () => {
    const { otpAuthUrl, secretKey } = await setup2FA();
    const qrcodeUrl = await toDataURL(otpAuthUrl, {
      margin: 2,
      quality: 1,
      type: "image/jpeg",
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

  const handleTOTPVerify = async (totp) => {
    const { [STORAGE_KEYS.userProfile]: userProfile } = await storage.get(
      STORAGE_KEYS.userProfile
    );
    const { isVerified } = await verify2FA(userProfile.uid, totp);
    if (!isVerified) {
      dispatch(
        displayToast({
          message: "Entered TOTP is incorrect",
          severity: "error",
        })
      );
      return;
    }
    userProfile.is2FAEnabled = true;
    await storage.set({ [STORAGE_KEYS.userProfile]: userProfile });
    handleClose();
  };

  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ p: "0px", backgroundColor: BG_COLOR_DARK }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IconButton
            aria-label="Close"
            component="span"
            style={COLOR.red}
            onClick={handleClose}
            title="Close"
          >
            <ArrowBackTwoToneIcon fontSize="large" />
          </IconButton>
          <PanelHeading
            containerStyles={{ display: "inline-flex" }}
            heading="SETUP 2FA"
          />
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: "10px",
          backgroundColor: BG_COLOR_BLACK,
        }}
      >
        <Avatar
          src={qrcodeUrl}
          alt="2FA QRCode"
          variant="square"
          sx={{ width: "180px", height: "180px" }}
        />
        {!showVerifyToken && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: "12px",
              position: "relative",
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
              <HelpOutlineOutlinedIcon
                sx={{ position: "absolute", left: "90px" }}
                fontSize="small"
              />
            </BlackTooltip>
          </Box>
        )}
        <Verify2FA isShown={showVerifyToken} handleVerify={handleTOTPVerify} />
      </DialogContent>
    </Dialog>
  );
});

export default Setup2FA;
