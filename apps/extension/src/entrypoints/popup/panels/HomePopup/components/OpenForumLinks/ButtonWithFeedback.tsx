import { Button, Spinner } from '@bypass/ui';
import { CheckIcon } from '@mantine/core';
import { MdForum } from 'react-icons/md';
import useFeedbackButton, { EButtonState } from './useFeedbackButton';

interface Props {
  openAllLinks: () => Promise<void>;
  isForumPage: boolean;
}

function ButtonWithFeedback({ openAllLinks, isForumPage }: Props) {
  const { buttonState, onClick } = useFeedbackButton(openAllLinks);

  if (isForumPage && buttonState === EButtonState.SUCCESS) {
    return (
      <Button
        className="w-full border-2 border-teal-500"
        variant="default"
        onClick={onClick}
      >
        Success
        <CheckIcon className="ml-2 size-4" />
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      variant="secondary"
      disabled={!isForumPage || buttonState === EButtonState.LOADING}
      onClick={onClick}
    >
      {buttonState === EButtonState.LOADING && (
        <Spinner className="mr-2 size-4 animate-spin" />
      )}
      Forum
      <MdForum className="ml-2 size-4" />
    </Button>
  );
}

export default ButtonWithFeedback;
