const turnOffAutocomplete = () => {
  document
    .querySelectorAll('input')
    .forEach((ele) => ele.setAttribute('autocomplete', 'off'));
};

const turnOffInputSuggestions = (tabId: number) => {
  browser.scripting.executeScript({
    target: { tabId },
    func: turnOffAutocomplete,
  });
};

export default turnOffInputSuggestions;
