import { ROUTES } from '@bypass/shared';
import { ActionIcon, Avatar, Box, Transition } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { MdSettings } from 'react-icons/md';
import { useLocation } from 'wouter';
import styles from './styles/UserProfile.module.css';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

function UserProfile() {
  const [, navigate] = useLocation();
  const { hovered, ref } = useHover();
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);
  const idpAuth = useFirebaseStore((state) => state.idpAuth);

  const handleOpenSettings = () => {
    navigate(ROUTES.SETTINGS_PANEL);
  };

  return (
    <Box pos="relative" ref={ref}>
      <Avatar
        radius="xl"
        size="3.125rem"
        src={idpAuth?.photoUrl}
        alt={idpAuth?.displayName}
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
}

export default UserProfile;
