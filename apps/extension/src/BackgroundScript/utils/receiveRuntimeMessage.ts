import {
  RuntimeInput,
  RuntimeKeys,
  RuntimeOutput,
} from '@/utils/sendRuntimeMessage';
import { manageGoogleActivity } from '../automation/manageGoogleActivity';
import { getForumPageLinks } from '../misc/forumPageLinks';
import { launchAuthFlow } from '../misc/launchAuthFlow';

export const receiveRuntimeMessage = (
  message: RuntimeInput,
  sendMessage: <T extends RuntimeKeys>(data: RuntimeOutput[T]) => void
) => {
  switch (message.key) {
    case 'openWebsiteLinks': {
      getForumPageLinks(message.tabId, message.url).then((forumPageLinks) => {
        sendMessage<'openWebsiteLinks'>({ forumPageLinks });
      });
      break;
    }
    case 'manageGoogleActivity': {
      manageGoogleActivity(message.historyWatchTime).then(() => {
        sendMessage<'manageGoogleActivity'>({ isSuccess: true });
      });
      break;
    }
    case 'launchAuthFlow': {
      launchAuthFlow().then((accessToken) => {
        sendMessage<'launchAuthFlow'>({ accessToken });
      });
      break;
    }
    default: {
      throw new Error(`Runtime message type not implemented: ${message}`);
    }
  }
};
