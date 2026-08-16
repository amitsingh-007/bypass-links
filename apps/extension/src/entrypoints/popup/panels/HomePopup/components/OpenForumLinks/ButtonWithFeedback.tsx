import {
  CheckmarkBadge02Icon,
  WebDesign01Icon,
} from '@hugeicons/core-free-icons';

import HomeActionButton from '../HomeActionButton';
import useFeedbackButton, { EButtonState } from './useFeedbackButton';

interface Props {
  openAllLinks: () => Promise<void>;
  isForumPage: boolean;
}

function ButtonWithFeedback({ openAllLinks, isForumPage }: Props) {
  const { buttonState, onClick } = useFeedbackButton(openAllLinks);

  const isSuccess = isForumPage && buttonState === EButtonState.SUCCESS;

  return (
    <HomeActionButton
      label={isSuccess ? 'Success' : 'Forum'}
      icon={isSuccess ? CheckmarkBadge02Icon : WebDesign01Icon}
      variant={isSuccess ? 'default' : 'secondary'}
      className={
        isSuccess
          ? 'border-teal-600 bg-teal-600 hover:border-teal-700 hover:bg-teal-700'
          : undefined
      }
      isBusy={buttonState === EButtonState.LOADING}
      disabled={!isForumPage}
      requiresSignIn={false}
      onClick={onClick}
    />
  );
}

export default ButtonWithFeedback;
