import { z } from 'zod/mini';

export const RuntimeInputSchema = z.discriminatedUnion('key', [
  z.object({
    key: z.literal('openWebsiteLinks'),
    tabId: z.number(),
    url: z.string(),
  }),
  z.object({ key: z.literal('openLinksInTabs'), urls: z.array(z.string()) }),
]);

export interface RuntimeOutput {
  openWebsiteLinks: { forumPageLinks: string[] };
  openLinksInTabs: undefined;
}

export type RuntimeInput = z.infer<typeof RuntimeInputSchema>;

export type RuntimeKeys = RuntimeInput['key'];

type RuntimeMessage<K extends RuntimeKeys> = Extract<RuntimeInput, { key: K }>;

export const sendRuntimeMessage = async <K extends RuntimeKeys>(
  input: RuntimeMessage<K>
): Promise<RuntimeOutput[K]> => {
  return browser.runtime.sendMessage<RuntimeMessage<K>, RuntimeOutput[K]>(
    input
  );
};
