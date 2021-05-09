import scripting from "ChromeApi/scripting";

const turnOffAutocomplete = () => {
  document
    .querySelectorAll("input")
    .forEach((ele) => ele.setAttribute("autocomplete", "off"));
};

const turnOffInputSuggestions = (tabId) => {
  scripting.executeScript(tabId, {
    function: turnOffAutocomplete,
    runAt: "document_end",
  });
};
export default turnOffInputSuggestions;
