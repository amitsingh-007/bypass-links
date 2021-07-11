import { Typography } from "@material-ui/core";
import { COLOR } from "GlobalConstants/color";
import { SxProps } from "@material-ui/system";

const titleStyles = {
  fontSize: "18px",
  marginRight: "14px",
  fontWeight: "700",
  color: COLOR.heading,
} as SxProps;

interface Props {
  heading: string;
  containerStyles?: SxProps;
}

const PanelHeading: React.FC<Props> = ({ heading, containerStyles = {} }) => (
  <Typography
    component="span"
    variant="h1"
    display="inline"
    sx={{ ...titleStyles, ...containerStyles }}
  >
    {heading}
  </Typography>
);

export default PanelHeading;
