const turnOffAutocomplete = () => {
  // oxlint-disable-next-line unicorn/consistent-function-scoping
  const apply = () =>
    document
      .querySelectorAll('input')
      .forEach((ele) => ele.setAttribute('autocomplete', 'off'));

  apply();

  const observer = new MutationObserver(apply);
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
