import { LoadingButton } from "@material-ui/lab";
import { memo } from "react";

const StyledButton = memo<{
  children: React.ReactNode;
  showSuccessColor: boolean;
  isLoading?: boolean;
  isDisabled: boolean;
  onClick: React.MouseEventHandler;
}>(({ children, showSuccessColor, isLoading = false, isDisabled, onClick }) => {
  return (
    <LoadingButton
      variant="outlined"
      sx={{
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        minWidth: "unset",
      }}
      color={showSuccessColor ? "success" : "error"}
      loading={isLoading}
      disabled={isDisabled}
      onClick={onClick}
    >
      {children}
    </LoadingButton>
  );
});
StyledButton.displayName = "StyledButton";

export default StyledButton;
