import { useWindowEvent } from '@mantine/hooks';
import StoreListener from './StoreListener';
import { NavigationProgress } from '@mantine/nprogress';
import { Notifications } from '@mantine/notifications';
import styles from './styles/Global.module.css';
import '@mantine/nprogress/styles.css';
import '@mantine/notifications/styles.css';

const Global = () => {
  // Prevent extension popup close on Escape click
  useWindowEvent('keydown', (e) => e.key === 'Escape' && e.preventDefault());

  return (
    <>
      <StoreListener />
      <NavigationProgress size={6} />
      <Notifications
        position="bottom-left"
        containerWidth="fit-content"
        autoClose={2000}
        classNames={{ notification: styles.notification }}
      />
    </>
  );
};

export default Global;
