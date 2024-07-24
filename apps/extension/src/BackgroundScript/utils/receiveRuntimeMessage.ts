import {
  RuntimeInput,
  RuntimeKeys,
  RuntimeOutput,
} from '@/utils/sendRuntimeMessage';
import { manageGoogleActivity } from '../automation/manageGoogleActivity';
import { getForumPageLinks } from '../misc/forumPageLinks';

export const receiveRuntimeMessage = (
  message: RuntimeInput,
  sendMessage: <T extends RuntimeKeys>(data: RuntimeOutput[T]) => void
) => {
  switch (message.key) {
    case 'forumPageLinks': {
      getForumPageLinks(message.tabId, message.url).then((forumPageLinks) => {
        sendMessage<'forumPageLinks'>({ forumPageLinks });
      });
      break;
    }
    case 'manageGoogleActivity': {
      manageGoogleActivity(message.historyWatchTime).then(() => {
        sendMessage<'manageGoogleActivity'>({ isSuccess: true });
      });
      break;
    }
    default: {
      throw new Error(`Runtime message type not implemented: ${message}`);
    }
  }
};
