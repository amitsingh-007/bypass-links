const turnOffAutocomplete = () => {
  const MARKER = 'bypassLinksAutocompleteOff';
  // Re-injected on every navigation, including same-document SPA ones, which
  // would otherwise leave one observer per navigation running on the document
  if (MARKER in document.documentElement.dataset) {
    return;
  }
  document.documentElement.dataset[MARKER] = '';

  // oxlint-disable-next-line unicorn/consistent-function-scoping
  const disable = (input: HTMLInputElement) => {
    input.setAttribute('autocomplete', 'off');
  };

  document.querySelectorAll('input').forEach(disable);

  const observer = new MutationObserver((mutations) => {
    // Only added nodes: re-querying the whole document per mutation is
    // unbounded work on pages that mutate continuously
    for (const { addedNodes } of mutations) {
      for (const node of addedNodes) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }
        if (node instanceof HTMLInputElement) {
          disable(node);
        }
        node.querySelectorAll('input').forEach(disable);
      }
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
  });
};

const turnOffInputSuggestions = (tabId: number) => {
  browser.scripting.executeScript({
    target: { tabId },
    func: turnOffAutocomplete,
  });
};

export default turnOffInputSuggestions;
