import { AppBar, Box, Toolbar } from "@material-ui/core";
import { memo } from "react";

const AppHeader = memo(() => (
  <AppBar
    position="static"
    sx={{
      background: "#202225",
      borderBottom: "1px solid #202225",
      boxShadow: "0 0 5px rgb(0 0 0 / 35%)",
      borderColor: "#080808",
      borderWidth: "0 0 1px",
    }}
  >
    <Toolbar sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          top: "80%",
          left: "50%",
        }}
      >
        <Box className="iconAnimate">
          <Box
            component="img"
            src="/assets/bypass_link_192.png"
            alt="app-icon"
            sx={{
              height: "75px",
              width: "75px",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#202225",
              borderRadius: "50%",
              padding: "3px",
            }}
          />
        </Box>
      </Box>
    </Toolbar>
  </AppBar>
));

export default AppHeader;
