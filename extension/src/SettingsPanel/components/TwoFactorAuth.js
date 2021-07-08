import { Box, Button } from "@material-ui/core";
import storage from "ChromeApi/storage";
import { displayToast } from "GlobalActionCreators/toast";
import { STORAGE_KEYS } from "GlobalConstants";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { revoke2FA } from "../apis/TwoFactorAuth";
import { getUserProfile } from "../utils";
import Setup2FA from "./Setup2FA";

const TwoFactorAuth = memo(() => {
  const dispatch = useDispatch();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  const initSetup2FA = async () => {
    const userProfile = await getUserProfile();
    setIs2FAEnabled(Boolean(userProfile.is2FAEnabled));
  };

  useEffect(() => {
    initSetup2FA();
  }, [show2FASetup]);

  const handle2FASetupClick = () => {
    if (is2FAEnabled) {
      handle2FARevoke();
    } else {
      setShow2FASetup(true);
    }
  };

  const handle2FARevoke = async () => {
    const userProfile = await getUserProfile();
    const { isRevoked } = await revoke2FA(userProfile.uid);
    if (!isRevoked) {
      dispatch(
        displayToast({ message: "Something went wrong", severity: "error" })
      );
      return;
    }
    userProfile.is2FAEnabled = false;
    userProfile.isTOTPVerified = false;
    await storage.set({
      [STORAGE_KEYS.userProfile]: userProfile,
    });
    setIs2FAEnabled(false);
    dispatch(displayToast({ message: "2FA revoked successfully" }));
  };

  const handleClose2FASetup = () => {
    setShow2FASetup(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>Two factor Authentication</Box>
        <Button
          size="small"
          variant="outlined"
          color={is2FAEnabled ? "secondary" : "primary"}
          onClick={handle2FASetupClick}
        >
          <strong>{is2FAEnabled ? "Revoke" : "Enable"}</strong>
        </Button>
        <Setup2FA handleClose={handleClose2FASetup} isOpen={show2FASetup} />
      </Box>
    </>
  );
});

export default TwoFactorAuth;
