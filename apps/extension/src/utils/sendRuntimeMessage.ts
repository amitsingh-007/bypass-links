export type RuntimeInput =
  | {
      key: 'openWebsiteLinks';
      tabId: number;
      url: string;
    }
  | {
      key: 'manageGoogleActivity';
      historyWatchTime: number;
    }
  | {
      key: 'launchAuthFlow';
    };

export type RuntimeOutput = {
  openWebsiteLinks: {
    forumPageLinks: string[];
  };
  manageGoogleActivity: {
    isSuccess: boolean;
  };
  launchAuthFlow: {
    accessToken: string | null;
  };
};

export type RuntimeKeys = RuntimeInput['key'];

export const sendRuntimeMessage = async <T extends RuntimeKeys>(
  input: { key: T } & RuntimeInput
) => {
  return chrome.runtime.sendMessage<any, RuntimeOutput[T]>(input);
};
