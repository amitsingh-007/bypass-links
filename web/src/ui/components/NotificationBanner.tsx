import { useEffect } from 'react';
import { googleSignIn } from '../utils/firebase/auth';
import { getFCMToken, onFCMMessage } from '../utils/firebase/messaging';

const Consent = () => {
  useEffect(() => {
    onFCMMessage(({ notification }) => {
      const { title, body } = notification || {};
      if (!title) {
        return;
      }
      new Notification(title, { body });
    });
  }, []);

  const ask = async () => {
    try {
      const token = await getFCMToken();
      if (token) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.mytoken = token;
        //TODO: Update to the server
      } else {
        Notification.requestPermission();
      }
    } catch (err) {
      console.log('An error occurred while retrieving token. ', err);
    }
  };

  const handleGoogleSignIn = async () => {
    const res = await googleSignIn();
    console.log(res);
  };
  return (
    <>
      <button onClick={ask}>ASK</button>
      <button onClick={handleGoogleSignIn}>SIGN-IN</button>
    </>
  );
};

export default Consent;
