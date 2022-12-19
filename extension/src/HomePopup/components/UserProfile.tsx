import { Avatar, Box, Fade, IconButton, SvgIcon } from '@mui/material';
import { ROUTES } from '@bypass/shared/constants/routes';
import { getUserProfile } from 'GlobalHelpers/fetchFromStorage';
import { memo, useEffect, useState } from 'react';
import { MdSettings } from 'react-icons/md';
import { RiUserUnfollowFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { UserInfo } from 'SrcPath/HomePopup/interfaces/authentication';
import useAuthStore from 'GlobalStore/auth';

const avatarStyles = { height: '50px', width: '50px' };

const UserProfile = memo(function UserProfile() {
  const navigate = useNavigate();
  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  const [userProfile, setUserProfile] = useState<UserInfo | null>(null);
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
    navigate(ROUTES.SETTINGS_PANEL);
  };

  return userProfile ? (
    <Box
      onMouseEnter={toggleSettingsIcon}
      onMouseLeave={toggleSettingsIcon}
      sx={{ position: 'relative' }}
    >
      <Avatar
        alt={userProfile.name}
        src={userProfile.picture}
        sx={avatarStyles}
      />
      <Fade in={showSettingsIcon} mountOnEnter unmountOnExit>
        <IconButton
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          onClick={handleOpenSettings}
        >
          <MdSettings />
        </IconButton>
      </Fade>
    </Box>
  ) : (
    <Avatar sx={avatarStyles}>
      <SvgIcon fontSize="medium">
        <RiUserUnfollowFill />
      </SvgIcon>
    </Avatar>
  );
});

export default UserProfile;
