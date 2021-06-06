import { setAuthenticationProgress } from "GlobalActionCreators";
import Toast from "GlobalComponents/Toast";
import { memo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { AUTHENTICATION_EVENT } from "SrcPath/HomePopup/constants/auth";
import StoreListener from "./StoreListener";

const Global = memo(() => {
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    const handleGoBack = (event) => {
      if (event.key === "Backspace") {
        history.goBack();
      }
    };
    document.body.addEventListener("keydown", handleGoBack);
    return () => {
      document.body.removeEventListener("keydown", handleGoBack);
    };
  }, [history]);

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
