import { Button, CheckIcon } from '@mantine/core';
import { MdForum } from 'react-icons/md';
import useFeedbackButton, { EButtonState } from './useFeedbackButton';
import styles from './styles/ButtonWithFeedback.module.css';

interface Props {
  openAllLinks: () => Promise<void>;
  isForumPage: boolean;
}

function ButtonWithFeedback({ openAllLinks, isForumPage }: Props) {
  const { buttonState, onClick } = useFeedbackButton(openAllLinks);

  if (isForumPage && buttonState === EButtonState.SUCCESS) {
    return (
      <Button
        fullWidth
        radius="xl"
        rightSection={<CheckIcon size={14} />}
        color="teal"
        className={styles.successButton}
        onClick={onClick}
      >
        Success
      </Button>
    );
  }

  return (
    <Button
      fullWidth
      radius="xl"
      loading={buttonState === EButtonState.LOADING}
      disabled={!isForumPage}
      rightSection={<MdForum />}
      color="yellow"
      onClick={onClick}
    >
      Forum
    </Button>
  );
}

export default ButtonWithFeedback;
