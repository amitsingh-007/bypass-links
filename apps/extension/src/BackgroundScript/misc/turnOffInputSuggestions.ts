import scripting from '@/utils/scripting';

const turnOffAutocomplete = () => {
  document
    .querySelectorAll('input')
    .forEach((ele) => ele.setAttribute('autocomplete', 'off'));
};

const turnOffInputSuggestions = (tabId: number) => {
  scripting.executeScript({
    target: { tabId },
    func: turnOffAutocomplete,
  });
};

export default turnOffInputSuggestions;
