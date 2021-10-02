import Toast from "GlobalComponents/Toast";
import { memo, useEffect } from "react";
import { useHistory } from "react-router-dom";
import StoreListener from "./StoreListener";

const Global = memo(function Global() {
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

  return (
    <>
      <StoreListener />
      <Toast />
    </>
  );
});

export default Global;
