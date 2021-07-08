import { Avatar, Box, Fade, IconButton } from "@material-ui/core";
import PersonOffIcon from "@material-ui/icons/PersonOff";
import SettingsRoundedIcon from "@material-ui/icons/SettingsRounded";
import { ROUTES } from "GlobalConstants/routes";
import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { getUserProfile } from "SrcPath/SettingsPanel/utils";

const avatarStyles = { height: "50px", width: "50px" };

const UserProfile = memo(() => {
  const history = useHistory();
  const { isSignedIn } = useSelector((state) => state.root);
  const [userProfile, setUserProfile] = useState(null);
  const [showSettingsIcon, setShowSettingsIcon] = useState(false);

  const initUserProfile = async () => {
    const userProfile = await getUserProfile();
    setUserProfile(userProfile);
  };

  useEffect(() => {
    initUserProfile();
  }, [isSignedIn]);

  const toggleSettingsIcon = () => {
    setShowSettingsIcon(!showSettingsIcon);
  };

  const handleOpenSettings = () => {
    history.push(ROUTES.SETTINGS_PANEL);
  };

  return userProfile ? (
    <Box
      onMouseEnter={toggleSettingsIcon}
      onMouseLeave={toggleSettingsIcon}
      sx={{ position: "relative" }}
    >
      <Avatar
        alt={userProfile.name}
        src={userProfile.picture}
        sx={avatarStyles}
      />
      <Fade direction="up" in={showSettingsIcon} mountOnEnter unmountOnExit>
        <IconButton
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          onClick={handleOpenSettings}
        >
          <SettingsRoundedIcon />
        </IconButton>
      </Fade>
    </Box>
  ) : (
    <Avatar sx={avatarStyles}>
      <PersonOffIcon fontSize="large" />
    </Avatar>
  );
});

export default UserProfile;
