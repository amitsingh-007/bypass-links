export interface RuntimeInput {
  key: 'openWebsiteLinks';
  tabId: number;
  url: string;
}

export interface RuntimeOutput {
  openWebsiteLinks: {
    forumPageLinks: string[];
  };
}

export type RuntimeKeys = RuntimeInput['key'];

export const sendRuntimeMessage = async <T extends RuntimeKeys>(
  input: { key: T } & RuntimeInput
) => {
  return browser.runtime.sendMessage<any, RuntimeOutput[T]>(input);
};
