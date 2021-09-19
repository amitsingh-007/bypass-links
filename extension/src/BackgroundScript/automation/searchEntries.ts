import scripting from "GlobalHelpers/chrome/scripting";
import tabs from "GlobalHelpers/chrome/tabs";

function removeEntriesRecur() {
  const observer = new MutationObserver((mutations) => {
    const isNodeRemoved = mutations.some(
      (mutation) => mutation.removedNodes.length > 0
    );
    if (isNodeRemoved) {
      observer.disconnect();
      removeEntriesRecur();
    }
  });
  const firstSearchEntry = document.querySelector("form ul li");
  const innerNode = firstSearchEntry?.querySelector<HTMLElement>("div");
  if (!innerNode?.children) {
    return;
  }
  const [removeButton] = [...innerNode.children].filter(
    (node) => node.textContent === "Remove"
  ) as HTMLElement[];
  removeButton?.click();
  observer.observe(firstSearchEntry as any, { childList: true, subtree: true });
}

export const clearSeachEntries = async (tabId: number) => {
  await scripting.executeScript({
    target: { tabId },
    func: removeEntriesRecur,
  });
};

export const stopClearSeachEntries = async (tabId: number) =>
  tabs.remove(tabId);
