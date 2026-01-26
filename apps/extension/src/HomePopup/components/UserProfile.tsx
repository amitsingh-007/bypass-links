import { Avatar } from '@mantine/core';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

function UserProfile() {
  const idpAuth = useFirebaseStore((state) => state.idpAuth);

  return (
    <Avatar
      radius="xl"
      size="3.125rem"
      src={idpAuth?.photoUrl}
      alt={idpAuth?.displayName}
      color="indigo"
    />
  );
}

export default UserProfile;
