import { EExtensionState } from '@/constants';
import { extStateItem, mappedRedirectionsItem } from '@/storage/items';
import { startHistoryWatch } from '@/utils/history';

import { isValidUrl } from '../utils';

let rebuilding = Promise.resolve();
let activePatterns: RegExp[] | undefined;

const buildRedirectRule = async (
  [alias, target]: [string, string],
  index: number
): Promise<chrome.declarativeNetRequest.Rule | undefined> => {
  try {
    const aliasUrl = new URL(alias);
    const targetUrl = new URL(target);
    if (
      !isValidUrl(alias) ||
      aliasUrl.href.includes('#') ||
      !['http:', 'https:'].includes(targetUrl.protocol)
    ) {
      console.warn('Skipping unsupported shortcut', alias, target);
      return undefined;
    }
    const suffix = aliasUrl.href.slice(aliasUrl.protocol.length + 2);
    const regexFilter = `^https?://${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
    const supported = await browser.declarativeNetRequest.isRegexSupported({
      regex: regexFilter,
      isCaseSensitive: true,
      requireCapturing: false,
    });
    if (!supported.isSupported) {
      console.warn(
        'Skipping unsupported shortcut regex',
        alias,
        supported.reason
      );
      return undefined;
    }
    return {
      id: index + 1,
      priority: index + 1,
      action: {
        type: 'redirect',
        redirect: { url: targetUrl.href },
      },
      condition: {
        regexFilter,
        isUrlFilterCaseSensitive: true,
        resourceTypes: ['main_frame'],
      },
    };
  } catch (error) {
    console.warn('Skipping invalid shortcut', alias, target, error);
    return undefined;
  }
};

const getRulePatterns = (rules: chrome.declarativeNetRequest.Rule[]) =>
  rules.flatMap(({ condition }) =>
    condition.regexFilter ? [new RegExp(condition.regexFilter)] : []
  );

export const rebuildRedirectRules = () => {
  rebuilding = rebuilding
    .then(async () => {
      const [state, shortcuts] = await Promise.all([
        extStateItem.getValue(),
        mappedRedirectionsItem.getValue(),
      ]);
      const candidates =
        state === EExtensionState.ACTIVE
          ? await Promise.all(Object.entries(shortcuts).map(buildRedirectRule))
          : [];
      const supportedRules = candidates.filter((rule) => rule !== undefined);
      const limit = browser.declarativeNetRequest.MAX_NUMBER_OF_REGEX_RULES;
      if (supportedRules.length > limit) {
        console.warn(
          `Shortcut rule limit reached; only the first ${limit} supported shortcuts are active`
        );
      }
      const addRules = supportedRules.slice(0, limit);
      const existing = await browser.declarativeNetRequest.getDynamicRules();
      await browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existing.map(({ id }) => id),
        addRules,
      });
      activePatterns = getRulePatterns(addRules);
      return undefined;
    })
    .catch((error) =>
      console.error('Could not rebuild shortcut redirects', error)
    );
  return rebuilding;
};

export const startShortcutHistoryWatch = async (url: string) => {
  if (!isValidUrl(url)) return;
  if (activePatterns === undefined) {
    const rules = await browser.declarativeNetRequest.getDynamicRules();
    activePatterns ??= getRulePatterns(rules);
  }
  const navigationUrl = new URL(url);
  if (activePatterns.some((pattern) => pattern.test(navigationUrl.href))) {
    await startHistoryWatch();
  }
};
