import { Button, Spinner } from '@bypass/ui';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkBadge02Icon,
  WebDesign01Icon,
} from '@hugeicons/core-free-icons';
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
        className="w-full border-teal-600 bg-teal-600 hover:border-teal-700 hover:bg-teal-700"
        variant="default"
        onClick={onClick}
      >
        Success
        <HugeiconsIcon
          icon={CheckmarkBadge02Icon}
          strokeWidth={2}
          className="ml-2 size-4"
        />
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
      <HugeiconsIcon
        icon={WebDesign01Icon}
        strokeWidth={2}
        className="ml-2 size-4"
      />
    </Button>
  );
}

export default ButtonWithFeedback;
