import scripting from "ChromeApi/scripting";

const turnOffAutocomplete = () => {
  document
    .querySelectorAll("input")
    .forEach((ele) => ele.setAttribute("autocomplete", "off"));
};

const turnOffInputSuggestions = (tabId) => {
  scripting.executeScript({
    target: { tabId },
    function: turnOffAutocomplete,
  });
};
export default turnOffInputSuggestions;
