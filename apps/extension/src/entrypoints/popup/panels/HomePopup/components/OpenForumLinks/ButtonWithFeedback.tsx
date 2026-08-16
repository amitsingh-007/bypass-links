import { Button, Spinner } from '@bypass/ui';
import { cn } from '@bypass/ui/lib/utils';
import {
  CheckmarkBadge02Icon,
  WebDesign01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import useFeedbackButton, { EButtonState } from './useFeedbackButton';

interface Props {
  openAllLinks: () => Promise<void>;
  isForumPage: boolean;
}

function ButtonWithFeedback({ openAllLinks, isForumPage }: Props) {
  const { buttonState, onClick } = useFeedbackButton(openAllLinks);

  const isSuccess = isForumPage && buttonState === EButtonState.SUCCESS;

  return (
    <Button
      className={cn(
        'w-full font-medium',
        isSuccess &&
          'border-teal-600 bg-teal-600 hover:border-teal-700 hover:bg-teal-700'
      )}
      variant={isSuccess ? 'default' : 'secondary'}
      disabled={!isForumPage || buttonState === EButtonState.LOADING}
      onClick={onClick}
    >
      {buttonState === EButtonState.LOADING && (
        <Spinner className="mr-2 size-4" />
      )}
      {isSuccess ? 'Success' : 'Forum'}
      <HugeiconsIcon
        icon={isSuccess ? CheckmarkBadge02Icon : WebDesign01Icon}
        strokeWidth={2}
        className="ml-2 size-4"
      />
    </Button>
  );
}

export default ButtonWithFeedback;
