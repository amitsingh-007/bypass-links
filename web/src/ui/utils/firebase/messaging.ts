import {
  getToken,
  getMessaging,
  onMessage,
  NotificationPayload,
  NextFn,
  MessagePayload,
  Observer,
} from 'firebase/messaging';
import firebaseApp from '.';

const messaging = getMessaging(firebaseApp);

export const getFCMToken = async () =>
  getToken(messaging, {
    serviceWorkerRegistration: await window.navigator.serviceWorker.register(
      '/sw.js'
    ),
  });

export const onFCMMessage = (
  nextOrObserver: NextFn<MessagePayload> | Observer<MessagePayload>
) => onMessage(messaging, nextOrObserver);
