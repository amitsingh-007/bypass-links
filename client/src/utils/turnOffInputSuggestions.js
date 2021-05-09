import scripting from "ChromeApi/scripting";

const turnOffAutocomplete = () => {
  document
    .querySelectorAll("input")
    .forEach((ele) => ele.setAttribute("autocomplete", "off"));
};

const turnOffInputSuggestions = (tabId) => {
  scripting.executeScript(tabId, {
    code: turnOffAutocomplete,
    runAt: "document_end",
  });
};
export default turnOffInputSuggestions;
