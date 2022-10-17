import { googleSignIn, googleSignOut } from '@/ui/firebase/auth';
import useUser from '@/ui/hooks/useUser';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useFirebaseQuery } from '@/ui/api';
import { FIREBASE_DB_REF } from '@common/constants/firebase';
import { ROUTES } from '@common/constants/routes';

export default function Web() {
  const router = useRouter();
  const { user } = useUser();
  const { isLoading } = useFirebaseQuery.useFirebaseDb(
    FIREBASE_DB_REF.bookmarks
  );

  //   Add helmet
  //   exclude this page from crawling(on link as well as this url itself)
  return (
    <>
      {!user ? (
        <button onClick={googleSignIn}>Login</button>
      ) : (
        <button onClick={googleSignOut}>Logout</button>
      )}
      {user && (
        <>
          {!isLoading && (
            <Button onClick={() => router.push(ROUTES.BOOKMARK_PANEL)}>
              Bookmarks Page
            </Button>
          )}
        </>
      )}
    </>
  );
}
