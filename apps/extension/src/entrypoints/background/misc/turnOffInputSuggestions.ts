const turnOffAutocomplete = () => {
  const MARKER = 'bypassLinksAutocompleteOff';
  // Re-injected per navigation, incl. same-document SPA ones
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
    // Added nodes only; a full re-query per mutation is unbounded work
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
