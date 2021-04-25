import { Avatar } from "@material-ui/core";
import PersonOffIcon from "@material-ui/icons/PersonOff";
import storage from "ChromeApi/storage";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const avatarStyles = { height: "50px", width: "50px" };

const UserProfile = memo(() => {
  const isSignedIn = useSelector((state) => state.isSignedIn);
  const [userProfile, setUserProfile] = useState(null);

  const initUserProfile = async () => {
    const { [STORAGE_KEYS.userProfile]: userProfile } = await storage.get(
      STORAGE_KEYS.userProfile
    );
    setUserProfile(userProfile);
  };

  useEffect(() => {
    initUserProfile();
  }, [isSignedIn]);

  return userProfile ? (
    <Avatar
      alt={userProfile.name}
      src={userProfile.picture}
      sx={avatarStyles}
    />
  ) : (
    <Avatar sx={avatarStyles}>
      <PersonOffIcon fontSize="large" />
    </Avatar>
  );
});

export default UserProfile;
