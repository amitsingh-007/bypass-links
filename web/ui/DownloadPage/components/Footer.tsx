import { Box, IconButton, SvgIconProps, Typography } from "@material-ui/core";
import AccessTimeFilledRoundedIcon from "@material-ui/icons/AccessTimeFilledRounded";
import ExtensionRoundedIcon from "@material-ui/icons/ExtensionRounded";
import GitHubIcon from "@material-ui/icons/GitHub";
import BackgroundImage from "@ui/components/BackgroundImage";

const Info = ({
  icon: Icon,
  text,
}: {
  icon: React.FC<SvgIconProps>;
  text: string;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", mt: "10px" }}>
    <Icon fontSize="small" />
    <Typography sx={{ ml: "10px", fontWeight: 500 }}>{text}</Typography>
  </Box>
);

const Footer = () => {
  return (
    <Box sx={{ mt: "100px" }}>
      <BackgroundImage src="/footer.png" alt="footer image" height="300px">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            pt: "212px",
            px: "200px",
          }}
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
      </BackgroundImage>
    </Box>
  );
};

export default Footer;
