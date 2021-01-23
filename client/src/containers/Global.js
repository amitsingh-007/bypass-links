import Toast from "GlobalComponents/Toast";
import StoreListener from "./StoreListener";

const Global = () => {
  return (
    <>
      <StoreListener />
      <Toast />
    </>
  );
};

export default Global;
