interface RuntimeInputMap {
  openWebsiteLinks: { tabId: number; url: string };
  openLinksInTabs: { urls: string[] };
}

export interface RuntimeOutput {
  openWebsiteLinks: { forumPageLinks: string[] };
  openLinksInTabs: undefined;
}

export type RuntimeKeys = keyof RuntimeInputMap;

export type RuntimeInput = {
  [K in RuntimeKeys]: { key: K } & RuntimeInputMap[K];
}[RuntimeKeys];

export const sendRuntimeMessage = async <T extends RuntimeInput>(
  input: T
): Promise<RuntimeOutput[T['key']]> => {
  return browser.runtime.sendMessage<any, RuntimeOutput[T['key']]>(input);
};
