import { Typography } from "@material-ui/core";
import { SxProps } from "@material-ui/system";

const titleStyles = {
  fontSize: "18px",
  marginRight: "14px",
  fontWeight: "700",
  color: "azure",
} as SxProps;

interface Props {
  heading: string | React.ReactNode;
  containerStyles?: SxProps;
}

const PanelHeading: React.FC<Props> = ({ heading, containerStyles = {} }) => (
  <Typography
    component="span"
    variant="h1"
    display="inline"
    sx={{
      userSelect: "none",
      ...titleStyles,
      ...containerStyles,
    }}
  >
    {heading}
  </Typography>
);

export default PanelHeading;
