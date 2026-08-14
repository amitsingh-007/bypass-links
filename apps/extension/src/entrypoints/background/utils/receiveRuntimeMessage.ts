import {
  type RuntimeInput,
  type RuntimeKeys,
  type RuntimeOutput,
} from '@/utils/sendRuntimeMessage';

import { getForumPageLinks } from '../misc/forumPageLinks';
import { openLinksInTabs } from '../misc/openLinksInTabs';

export const receiveRuntimeMessage = (
  message: RuntimeInput,
  sendMessage: (data: RuntimeOutput[RuntimeKeys]) => void
) => {
  switch (message.key) {
    case 'openWebsiteLinks': {
      getForumPageLinks(message.tabId, message.url)
        .then((forumPageLinks) => {
          sendMessage({ forumPageLinks });
        })
        .catch((error) => {
          // The popup awaits this reply, so staying silent leaves it hanging
          console.error('Failed to collect forum links', error);
          sendMessage({ forumPageLinks: [] });
        });
      break;
    }

    case 'openLinksInTabs': {
      sendMessage(undefined);
      openLinksInTabs(message.urls);
      break;
    }
  }
};
