export type RuntimeInput =
  | {
      key: 'forumPageLinks';
      tabId: number | undefined;
      url: string | undefined;
    }
  | {
      key: 'manageGoogleActivity';
      historyWatchTime: number;
    }
  | {
      key: 'launchAuthFlow';
    };

export type RuntimeOutput = {
  forumPageLinks: {
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
