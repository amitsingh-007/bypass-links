import { Box, IconButton, Typography } from "@material-ui/core";
import AccessTimeFilledRoundedIcon from "@material-ui/icons/AccessTimeFilledRounded";
import ExtensionRoundedIcon from "@material-ui/icons/ExtensionRounded";
import GitHubIcon from "@material-ui/icons/GitHub";

const Info = ({ icon: Icon, text }) => (
  <Box sx={{ display: "flex", alignItems: "center", mt: "10px" }}>
    <Icon fontSize="small" />
    <Typography sx={{ ml: "10px", fontWeight: 500 }}>{text}</Typography>
  </Box>
);

const Footer = () => {
  return (
    <Box
      sx={{
        mt: "100px",
        height: "300px",
        padding: "20px 200px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        background: "url(/assets/footer.png)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <Box
        sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Info icon={ExtensionRoundedIcon} text={`v ${__EXT_VERSION__}`} />
          <Info icon={AccessTimeFilledRoundedIcon} text={__RELEASE_DATE__} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="a"
            href="https://github.com/amitsingh-007/bypass-links"
            title="Bypass Links Github Page"
          >
            <IconButton>
              <GitHubIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
