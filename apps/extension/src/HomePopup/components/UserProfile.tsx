import { UserInfo } from '@/HomePopup/interfaces/authentication';
import { ROUTES } from '@bypass/shared';
import { getUserProfile } from '@helpers/fetchFromStorage';
import { ActionIcon, Avatar, Box, Transition } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import useAuthStore from '@store/auth';
import { memo, useEffect, useState } from 'react';
import { MdSettings } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

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
        size={50}
        src={userProfile?.picture}
        alt={userProfile?.name}
        color="indigo"
      />
      <Transition mounted={hovered && isSignedIn} transition="fade">
        {(styles) => (
          <Box
            style={styles}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <ActionIcon
              radius="xl"
              variant="subtle"
              size={50}
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
