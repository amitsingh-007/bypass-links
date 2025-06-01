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
        radius="xl"
        onClick={onClick}
        rightSection={<CheckIcon size={14} />}
        fullWidth
        color="teal"
        className={styles.successButton}
      >
        Success
      </Button>
    );
  }

  return (
    <Button
      radius="xl"
      loading={buttonState === EButtonState.LOADING}
      disabled={!isForumPage}
      onClick={onClick}
      rightSection={<MdForum />}
      fullWidth
      color="yellow"
    >
      Forum
    </Button>
  );
}

export default ButtonWithFeedback;
