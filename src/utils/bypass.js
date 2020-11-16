import { REDIRECTIONS } from "../constants";
import { bypassBonsai } from "./bypassBonsai";
import { bypassBonsaiLink } from "./bypassBonsaiLink";
import { bypassForums } from "./bypassForums";
import { bypassLinkvertise } from "./bypassLinkvertise";
import { bypassMedium } from "./bypassMedium";
import { bypassPageLinks } from "./bypassPageLinks";
import { changeTabUrl } from "./changeTabUrl";

const BYPASS_EXECUTORS = [
  bypassLinkvertise,
  bypassBonsai,
  bypassBonsaiLink,
  bypassForums,
  bypassPageLinks,
  bypassMedium,
];

export const bypass = async (tabId, url) => {
  BYPASS_EXECUTORS.forEach(async (executor) => {
    await executor(url, tabId);
  });
};

export const redirect = async (tabId, url) => {
  const redirectUrl = REDIRECTIONS[url.href];
  if (redirectUrl) {
    await changeTabUrl(tabId, atob(redirectUrl));
  }
};
