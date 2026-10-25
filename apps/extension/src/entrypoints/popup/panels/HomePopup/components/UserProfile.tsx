import { Avatar, AvatarFallback, AvatarImage } from '@bypass/ui';
import { UserWarning03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import useFirebaseStore from '@/store/firebase/useFirebaseStore';

function UserProfile() {
  const photoUrl = useFirebaseStore(
    (state) => state.idpAuth?.photoURL ?? undefined
  );
  const displayName = useFirebaseStore(
    (state) => state.idpAuth?.displayName ?? undefined
  );

  return (
    <Avatar className="size-12">
      <AvatarImage src={photoUrl} alt={displayName} />
      <AvatarFallback>
        <HugeiconsIcon icon={UserWarning03Icon} />
      </AvatarFallback>
    </Avatar>
  );
}

export default UserProfile;
