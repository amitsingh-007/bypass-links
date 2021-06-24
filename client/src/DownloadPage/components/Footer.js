import { Box } from "@material-ui/core";

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
        background: "url(/footer.png)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    ></Box>
  );
};

export default Footer;
