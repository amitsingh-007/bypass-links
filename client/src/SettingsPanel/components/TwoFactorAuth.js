import { Box, Button } from "@material-ui/core";
import storage from "ChromeApi/storage";
import { STORAGE_KEYS } from "GlobalConstants/";
import { memo, useEffect, useState } from "react";
import Setup2FA from "./Setup2FA";

const TwoFactorAuth = memo(() => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  const initSetup2FA = async () => {
    const { [STORAGE_KEYS.userProfile]: userProfile } = await storage.get(
      STORAGE_KEYS.userProfile
    );
    setIs2FAEnabled(Boolean(userProfile.is2FAEnabled));
  };

  useEffect(() => {
    initSetup2FA();
  }, [show2FASetup]);

  const handle2FASetupClick = () => {
    if (is2FAEnabled) {
      //TODO: handle this
    } else {
      setShow2FASetup(true);
    }
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
          <strong>{is2FAEnabled ? "Enabled" : "Enable"}</strong>
        </Button>
        <Setup2FA handleClose={handleClose2FASetup} isOpen={show2FASetup} />
      </Box>
    </>
  );
});

export default TwoFactorAuth;
