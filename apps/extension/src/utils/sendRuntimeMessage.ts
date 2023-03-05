export type RuntimeInput =
  | {
      key: 'forumPageLinks';
      tabId: number | undefined;
      url: string | undefined;
    }
  | {
      key: 'manageGoogleActivity';
      historyWatchTime: number;
    };

export type RuntimeOutput = {
  forumPageLinks: {
    forumPageLinks: string[];
  };
  manageGoogleActivity: {
    isSuccess: boolean;
  };
};

export type RuntimeKeys = RuntimeInput['key'];

export const sendRuntimeMessage = async <T extends RuntimeKeys>(
  input: { key: T } & RuntimeInput
) => {
  return chrome.runtime.sendMessage<any, RuntimeOutput[T]>(input);
};
