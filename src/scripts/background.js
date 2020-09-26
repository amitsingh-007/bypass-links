import { EXTENSION_STATE } from "../constants";
import { bypass } from "../utils/bypass";
import { showToast } from "../utils/showToast";

let extensionState = EXTENSION_STATE.ACTIVE;

const onUpdateCallback = (tabId, changeInfo) => {
  const { url } = changeInfo;
  if (url) {
    bypass(tabId, url, extensionState);
  }
};

const handleExtensionToggle = (command) => {
  if (command === "toggle_bypass_links_extension") {
    const isCurrentlyActive = extensionState === EXTENSION_STATE.ACTIVE;
    extensionState = isCurrentlyActive
      ? EXTENSION_STATE.INACTIVE
      : EXTENSION_STATE.ACTIVE;
  }
};

//Listen tab url change
chrome.tabs.onUpdated.addListener(onUpdateCallback);

//Listen key press for toggle
chrome.commands.onCommand.addListener(handleExtensionToggle);
