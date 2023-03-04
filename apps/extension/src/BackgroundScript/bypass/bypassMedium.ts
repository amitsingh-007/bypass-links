import scripting from '@helpers/chrome/scripting';
import windows from '@helpers/chrome/windows';

const MEDIUM_HOMEPAGE = 'https://medium.com/';

const MEDIUM_WHITELISTED = [
  'https://medium.com/@suncommander',
  'https://medium.com/me/',
];

interface IBypassMedium {
  hasPaywall: boolean;
}

const shouldSkipBypassingMedium = (
  url: string,
  searchParams: URLSearchParams
) =>
  url === MEDIUM_HOMEPAGE ||
  MEDIUM_WHITELISTED.find((link) => url.includes(link)) ||
  searchParams.get('source');

const shouldBypass = (): IBypassMedium => {
  return {
    hasPaywall: !!document.getElementById('paywall-background-color'),
  };
};

export const bypassMedium = async (url: URL, tabId: number) => {
  if (shouldSkipBypassingMedium(url.href, url.searchParams)) {
    return;
  }

  const response = await scripting.executeScript({
    target: { tabId },
    func: shouldBypass,
  });
  const { result }: { result: IBypassMedium | null } = response[0];
  if (result?.hasPaywall) {
    await windows.create({
      url: url.href,
      state: 'maximized',
      incognito: true,
    });
    chrome.tabs.goBack(tabId);
  }
};
