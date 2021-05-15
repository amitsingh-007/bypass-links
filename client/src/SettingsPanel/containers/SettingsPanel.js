import { Box } from "@material-ui/core";
import { memo } from "react";
import Header from "../components/Header";
import TwoFactorAuth from "../components/TwoFactorAuth";

const SettingsPanel = memo(() => {
  return (
    <Box sx={{ width: "400px", height: "400px" }}>
      <Header />
      <Box sx={{ p: "14px 16px" }}>
        <TwoFactorAuth />
      </Box>
    </Box>
  );
});

export default SettingsPanel;
