import { setAuthenticationProgress } from "GlobalActionCreators/index";
import Toast from "GlobalComponents/Toast";
import { memo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AUTHENTICATION_EVENT } from "SrcPath/HomePopup/constants/auth";
import StoreListener from "./StoreListener";

const Global = memo(() => {
  const dispatch = useDispatch();

  const handleAuthenticationEvent = useCallback(
    (event) => {
      dispatch(setAuthenticationProgress(event.detail));
    },
    [dispatch]
  );

  useEffect(() => {
    document.addEventListener(AUTHENTICATION_EVENT, handleAuthenticationEvent);
    return () => {
      document.removeEventListener(
        AUTHENTICATION_EVENT,
        handleAuthenticationEvent
      );
    };
  }, [handleAuthenticationEvent]);

  return (
    <>
      <StoreListener />
      <Toast />
    </>
  );
});

export default Global;
