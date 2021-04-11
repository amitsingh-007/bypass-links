import {
  Box,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { memo } from "react";
import StarRoundedIcon from "@material-ui/icons/StarRounded";

const features = [
  "Use Bypass Links browser extension to bypass timers, ads, captchas, etc on various websites to land directly on the target links.",
  "Manipulate browser history.",
  "A fully customised shortcuts panel to add/edit/delete/drag-n-drop custom redirection rules stored in Firebase.",
  "Full dark theme support with Modern UI",
  <>
    Visit
    <Link
      href="https://github.com/amitsingh-007/bypass-links/#readme"
      target="_blank"
    >
      {" My Github Page "}
    </Link>
    to see all the currently supported websites to bypass.
  </>,
];

const listItemStyles = {
  paddingTop: "3px",
  paddingBottom: "3px",
};

const primaryTypographyProps = {
  variant: "h6",
  style: {
    fontSize: "17px",
  },
};

const Features = memo(() => (
  <Box className="customBgColor">
    <List>
      {features.map((feature) => (
        <ListItem style={listItemStyles} key={feature}>
          <ListItemIcon>
            <StarRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary={feature}
            primaryTypographyProps={primaryTypographyProps}
          />
        </ListItem>
      ))}
    </List>
  </Box>
));

export default Features;
