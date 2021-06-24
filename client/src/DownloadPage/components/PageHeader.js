import { Box, Button, Typography } from "@material-ui/core";
import { memo } from "react";

const PageHeader = memo(() => {
  return (
    <Box
      sx={{
        m: "230px 88px 0px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <Typography
        component="h2"
        variant="h3"
        sx={{
          textAlign: "center",
          fontSize: "40px",
          fontWeight: "bold",
          lineHeight: "1.5",
        }}
      >
        Have a Link Bypasser and private Bookmarks Panel !
      </Typography>
      <Box sx={{ textAlign: "center" }}>
        <Button
          sx={{
            background: "linear-gradient(90deg,#6850ff,#a750ff)",
            borderRadius: "50px",
            fontWeight: "bold",
            fontSize: "17px",
            color: "#fff",
            padding: "14px 27px",
            mt: "15px",
          }}
        >
          Download Now
        </Button>
      </Box>
    </Box>
  );
});

export default PageHeader;
