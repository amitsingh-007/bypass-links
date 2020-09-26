const toastScript = () => {
  const body = document.getElementsByTagName("body")[0];
  const toast = document.createElement("div");
  toast.id = "snackbar";
  toast.className = "show";
  toast.textContent = "Bypass Links Extension Toggled";
  body.appendChild(toast);
  // After 2 seconds, remove the show class from toast div
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 2000);
};

const executeToastScript = () => {
  chrome.tabs.executeScript({ code: `(${toastScript})()` }, () => {
    // shown in devtools of the popup window
    if (chrome.runtime.lastError) {
      console.log("Error in executing toast script.", chrome.runtime.lastError);
    }
  });
};

const injectCssFile = () => {
  chrome.tabs.insertCSS({ file: "toast.css" }, () => {
    // shown in devtools of the popup window
    if (!chrome.runtime.lastError) {
      executeToastScript();
    } else {
      console.log("Error while inserting css file.", chrome.runtime.lastError);
    }
  });
};

export const showToast = () => {
  injectCssFile();
};
