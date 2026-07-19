import {
  type RuntimeInput,
  type RuntimeKeys,
  type RuntimeOutput,
} from '@/utils/sendRuntimeMessage';

import { getForumPageLinks } from '../misc/forumPageLinks';

export const receiveRuntimeMessage = (
  message: RuntimeInput,
  sendMessage: (data: RuntimeOutput[RuntimeKeys]) => void
) => {
  switch (message.key) {
    case 'openWebsiteLinks': {
      getForumPageLinks(message.tabId, message.url).then((forumPageLinks) => {
        sendMessage({ forumPageLinks });
      });
      break;
    }
  }
};
