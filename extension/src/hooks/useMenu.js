import { useState } from "react";

const initialMouseState = { mouseX: null, mouseY: null };

const getAnchorPosition = ({ mouseX, mouseY }) =>
  mouseY !== null && mouseX !== null
    ? { top: mouseY, left: mouseX }
    : undefined;

const useMenu = () => {
  const [mouseState, setMouseState] = useState(initialMouseState);

  const handleOptionsOpen = (event) => {
    event.preventDefault();
    setMouseState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };
  const handleOptionsClose = () => {
    setMouseState(initialMouseState);
  };

  const isOpen = mouseState.mouseY !== null;
  const anchorPosition = getAnchorPosition(mouseState);
  return [isOpen, anchorPosition, handleOptionsClose, handleOptionsOpen];
};

export default useMenu;
