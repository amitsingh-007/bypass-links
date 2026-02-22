import { Avatar, AvatarFallback, AvatarImage } from '@bypass/ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserWarning03Icon } from '@hugeicons/core-free-icons';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

function UserProfile() {
  const idpAuth = useFirebaseStore((state) => state.idpAuth);

  return (
    <Avatar className="size-12">
      <AvatarImage src={idpAuth?.photoUrl} alt={idpAuth?.displayName} />
      <AvatarFallback>
        <HugeiconsIcon icon={UserWarning03Icon} />
      </AvatarFallback>
    </Avatar>
  );
}

export default UserProfile;
