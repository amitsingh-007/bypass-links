const { default: tabs } = require("ChromeApi/tabs");

const turnOffAutocomplete = () => {
  document
    .querySelectorAll("input")
    .forEach((ele) => ele.setAttribute("autocomplete", "off"));
};

const turnOffInputSuggestions = (tabId) => {
  tabs.executeScript(tabId, {
    code: `(${turnOffAutocomplete})()`,
    runAt: "document_end",
  });
};
export default turnOffInputSuggestions;
