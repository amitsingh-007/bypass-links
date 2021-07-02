import { Box, Button, LinearProgress, TextField } from "@material-ui/core";
import { memo, useState } from "react";
import { TOTP_LENGTH } from "../constants";

const totpInputStyles = {
  marginRight: "10px",
  "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
    {
      display: "none",
    },
};

const Verify2FA = memo(
  ({ isShown, handleVerify, containerStyles = {}, buttonStyles = {} }) => {
    const [totp, setTOTP] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    if (!isShown) {
      return null;
    }

    const handleTOTPChange = (event) => {
      const totp = event.target.value?.slice(0, TOTP_LENGTH);
      setTOTP(totp);
    };

    const handleTOTPVerify = async (e) => {
      e.preventDefault();
      setIsVerifying(true);
      await handleVerify(totp);
      setIsVerifying(false);
    };

    return (
      <>
        <Box
          component="form"
          sx={{ display: "flex", marginTop: "50px", ...containerStyles }}
          onSubmit={handleTOTPVerify}
        >
          <TextField
            required
            autoFocus
            fullWidth
            size="small"
            type="number"
            color="primary"
            variant="outlined"
            label="Enter TOTP to verify"
            title={totp}
            value={totp}
            onChange={handleTOTPChange}
            sx={totpInputStyles}
          />
          <Button
            type="submit"
            variant="outlined"
            color="secondary"
            onClick={handleTOTPVerify}
            disabled={totp.length !== TOTP_LENGTH}
            sx={{ ...buttonStyles }}
          >
            <strong>Verify</strong>
          </Button>
        </Box>
        {isVerifying && (
          <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%" }}>
            <LinearProgress color="secondary" />
          </Box>
        )}
      </>
    );
  }
);

export default Verify2FA;
