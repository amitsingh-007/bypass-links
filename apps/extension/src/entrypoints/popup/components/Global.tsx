import '@mantine/notifications/styles.css';
import { useWindowEvent } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import StoreListener from './StoreListener';
import styles from './styles/Global.module.css';

function Global() {
  // Prevent extension popup close on Escape click
  useWindowEvent('keydown', (e) => e.key === 'Escape' && e.preventDefault());

  return (
    <>
      <StoreListener />
      <Notifications
        position="bottom-left"
        containerWidth="fit-content"
        autoClose={2000}
        classNames={{ notification: styles.notification }}
      />
    </>
  );
}

export default Global;
