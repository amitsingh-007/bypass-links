import scripting from "GlobalHelpers/chrome/scripting";

const getForumPageLinksFunc = () => {
  const unreadRows = document.querySelectorAll(
    ".block-row.block-row--separated:not(.block-row--alt)"
  );
  return [...unreadRows].map(
    (row) =>
      row.querySelector<HTMLAnchorElement>("a.fauxBlockLink-blockLink")?.href
  );
};

export const getForumPageLinks = async (tabId: number): Promise<string[]> => {
  const [{ result }] = await scripting.executeScript({
    target: { tabId },
    func: getForumPageLinksFunc,
  });
  return new Promise((resolve) => {
    resolve(result);
  });
};
