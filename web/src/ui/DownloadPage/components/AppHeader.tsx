import { AppBar, Box, Toolbar } from "@mui/material";
import { memo } from "react";
import Image from "next/image";

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
            sx={{
              transform: "translate(-50%, -50%)",
              backgroundColor: "#202225",
              borderRadius: "50%",
              padding: "3px",
              "> div": { verticalAlign: "middle" },
            }}
          >
            <Image
              src="/bypass_link_192.png"
              alt="app-icon"
              height={75}
              width={75}
              priority
            />
          </Box>
        </Box>
      </Box>
    </Toolbar>
  </AppBar>
));
AppHeader.displayName = "AppHeader";

export default AppHeader;
