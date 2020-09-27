import { EXTENSION_STATE } from "../constants";

const enabledToastScript = () => {
  const existingToast = document.getElementById("bypass-links-snackbar");
  existingToast && existingToast.remove();
  const body = document.getElementsByTagName("body")[0];
  const toast = document.createElement("div");
  toast.id = "bypass-links-snackbar";
  toast.className = "show";
  toast.textContent = "Bypass Links Extension Enabled";
  body.appendChild(toast);
  // After 2 seconds, remove the show class from toast div
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 2000);
};

const disabledToastScript = () => {
  const existingToast = document.getElementById("bypass-links-snackbar");
  existingToast && existingToast.remove();
  const body = document.getElementsByTagName("body")[0];
  const toast = document.createElement("div");
  toast.id = "bypass-links-snackbar";
  toast.className = "show";
  toast.textContent = "Bypass Links Extension Disabled";
  body.appendChild(toast);
  // After 2 seconds, remove the show class from toast div
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 2000);
};

const executeToastScript = (state) => {
  const toastScript =
    state === EXTENSION_STATE.ACTIVE ? enabledToastScript : disabledToastScript;
  chrome.tabs.executeScript({ code: `(${toastScript})()` }, () => {
    // shown in devtools of the popup window
    if (chrome.runtime.lastError) {
      console.log("Error in executing toast script.", chrome.runtime.lastError);
    }
  });
};

const injectCssFile = (state) => {
  const file =
    state === EXTENSION_STATE.ACTIVE ? "enabledToast.css" : "disabledToast.css";
  chrome.tabs.insertCSS({ file }, () => {
    // shown in devtools of the popup window
    if (!chrome.runtime.lastError) {
      executeToastScript(state);
    } else {
      console.log("Error while inserting css file.", chrome.runtime.lastError);
    }
  });
};

export const showToast = (state) => {
  injectCssFile(state);
};
