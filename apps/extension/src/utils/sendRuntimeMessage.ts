interface RuntimeInputMap {
  openWebsiteLinks: { tabId: number; url: string };
  openLinksInTabs: { urls: string[] };
}

export interface RuntimeOutput {
  openWebsiteLinks: { forumPageLinks: string[] };
  openLinksInTabs: undefined;
}

export type RuntimeKeys = keyof RuntimeInputMap;

type RuntimeMessage<K extends RuntimeKeys> = { key: K } & RuntimeInputMap[K];

export type RuntimeInput = {
  [K in RuntimeKeys]: RuntimeMessage<K>;
}[RuntimeKeys];

export const sendRuntimeMessage = async <K extends RuntimeKeys>(
  input: RuntimeMessage<K>
): Promise<RuntimeOutput[K]> => {
  return browser.runtime.sendMessage<RuntimeMessage<K>, RuntimeOutput[K]>(
    input
  );
};
