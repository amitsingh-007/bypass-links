import { setAuthenticationProgress } from "GlobalActionCreators/auth";
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
    const handleGoBack = (event: KeyboardEvent) => {
      const isBackspace = event.key === "Backspace";
      const isInputElem = (event.target as Element).tagName === "INPUT";
      if (isBackspace && !isInputElem) {
        history.goBack();
      }
    };
    document.body.addEventListener("keydown", handleGoBack);
    return () => {
      document.body.removeEventListener("keydown", handleGoBack);
    };
  }, [history]);

  //TODO: after custom event consumtion
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
