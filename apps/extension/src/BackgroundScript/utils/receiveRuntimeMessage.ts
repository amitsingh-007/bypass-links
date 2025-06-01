import { getForumPageLinks } from '../misc/forumPageLinks';
import { launchAuthFlow } from '../misc/launchAuthFlow';
import {
  RuntimeInput,
  RuntimeKeys,
  RuntimeOutput,
} from '@/utils/sendRuntimeMessage';

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
    case 'launchAuthFlow': {
      launchAuthFlow().then((accessToken) => {
        sendMessage<'launchAuthFlow'>({ accessToken });
      });
      break;
    }
  }
};
