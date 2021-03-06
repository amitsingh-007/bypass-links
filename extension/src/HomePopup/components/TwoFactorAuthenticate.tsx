import { Dialog, DialogContent, Slide } from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";
import storage from "GlobalHelpers/chrome/storage";
import { displayToast } from "GlobalActionCreators/toast";
import { STORAGE_KEYS } from "GlobalConstants";
import { BG_COLOR_BLACK } from "GlobalConstants/color";
import { RootState } from "GlobalReducers/rootReducer";
import { forwardRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authenticate2FA } from "SrcPath/SettingsPanel/apis/twoFactorAuth";
import Verify2FA from "SrcPath/SettingsPanel/components/Verify2FA";
import { getUserProfile } from "GlobalHelpers/fetchFromStorage";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TwoFactorAuthenticate = () => {
  const dispatch = useDispatch();
  const { isSignedIn } = useSelector((state: RootState) => state.root);
  const [promptTOTPVerify, setPromptTOTPVerify] = useState(false);

  const initTOTPPrompt = async () => {
    const userProfile = await getUserProfile();
    if (userProfile.is2FAEnabled) {
      setPromptTOTPVerify(!userProfile.isTOTPVerified);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      initTOTPPrompt();
    }
  }, [isSignedIn]);

  const handleAuthenticateTOTP = async (totp: string) => {
    const userProfile = await getUserProfile();
    const { isVerified } = await authenticate2FA(userProfile.uid ?? "", totp);
    if (!isVerified) {
      dispatch(
        displayToast({
          message: "Entered TOTP is incorrect",
          severity: "error",
        })
      );
      return;
    }
    userProfile.isTOTPVerified = true;
    await storage.set({ [STORAGE_KEYS.userProfile]: userProfile });
    setPromptTOTPVerify(false);
  };

  return (
    <Dialog fullScreen open={promptTOTPVerify} TransitionComponent={Transition}>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: "10px",
          backgroundColor: BG_COLOR_BLACK,
        }}
      >
        <Verify2FA
          isShown
          handleVerify={handleAuthenticateTOTP}
          containerStyles={{ mt: "0px", flexDirection: "column" }}
          buttonStyles={{ mt: "20px" }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorAuthenticate;
