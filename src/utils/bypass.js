import { EXTENSION_STATE, HOSTNAME } from "../constants";
import { bypassBonsai } from "./bypassBonsai";
import { bypassBonsaiLink } from "./bypassBonsaiLink";
import { bypassForums } from "./bypassForums";
import { bypassLinkvertise } from "./bypassLinkvertise";
import { bypassMedium } from "./bypassMedium";
import { bypassPageLinks } from "./bypassPageLinks";

const BYPASS_EXECUTORS = [
  bypassLinkvertise,
  bypassBonsai,
  bypassBonsaiLink,
  bypassForums,
  bypassPageLinks,
  bypassMedium,
];

export const bypass = async (tabId, url, extensionState) => {
  if (extensionState === EXTENSION_STATE.INACTIVE) {
    return;
  }
  const currentTabUrl = new URL(url);
  BYPASS_EXECUTORS.forEach(async (executor) => {
    await executor(currentTabUrl, tabId);
  });
};
