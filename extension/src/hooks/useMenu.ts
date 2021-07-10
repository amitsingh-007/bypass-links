import React, { useState } from "react";
import { PopoverPosition } from "@material-ui/core/Popover";

const initialMouseState = { left: 0, top: 0 };

const useMenu = (): [
  boolean,
  PopoverPosition,
  () => void,
  (event: React.MouseEvent<HTMLElement>) => void
] => {
  const [mouseState, setMouseState] =
    useState<PopoverPosition>(initialMouseState);

  const handleOptionsOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setMouseState({
      left: event.clientX - 2,
      top: event.clientY - 4,
    });
  };
  const handleOptionsClose = () => {
    setMouseState(initialMouseState);
  };

  const isOpen = mouseState.top !== 0;
  return [isOpen, mouseState, handleOptionsClose, handleOptionsOpen];
};

export default useMenu;
