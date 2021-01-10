import Toast from "GlobalComponents/Toast";
import React from "react";
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
