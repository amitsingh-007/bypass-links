import { UserInfo } from '@/HomePopup/interfaces/authentication';
import { ROUTES } from '@bypass/shared';
import { getUserProfile } from '@helpers/fetchFromStorage';
import { ActionIcon, Avatar, Box, Transition } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import useAuthStore from '@store/auth';
import { memo, useEffect, useState } from 'react';
import { MdSettings } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import styles from './styles/UserProfile.module.css';

const UserProfile = memo(function UserProfile() {
  const navigate = useNavigate();
  const { hovered, ref } = useHover();
  const isSignedIn = useAuthStore((state) => state.isSignedIn);
  const [userProfile, setUserProfile] = useState<UserInfo | null>(null);

  const initUserProfile = async () => {
    const profile = await getUserProfile();
    setUserProfile(profile);
  };

  useEffect(() => {
    initUserProfile();
  }, [isSignedIn]);

  const handleOpenSettings = () => {
    navigate(ROUTES.SETTINGS_PANEL);
  };

  return (
    <Box pos="relative" ref={ref}>
      <Avatar
        radius="xl"
        size="3.125rem"
        src={userProfile?.picture}
        alt={userProfile?.name}
        color="indigo"
      />
      <Transition mounted={hovered && isSignedIn} transition="fade">
        {(style) => (
          <Box style={style} className={styles.settingsIconWrapper}>
            <ActionIcon
              radius="xl"
              c="white"
              size="3.125rem"
              onClick={handleOpenSettings}
            >
              <MdSettings size="20px" />
            </ActionIcon>
          </Box>
        )}
      </Transition>
    </Box>
  );
});

export default UserProfile;
