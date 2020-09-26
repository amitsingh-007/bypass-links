import { EXTENSION_STATE } from "../constants";
import { bypass } from "../utils/bypass";

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
    console.log(`New value of extensionState is set to ${extensionState}`);
    //show popup here
  }
};

//Listen tab url change
chrome.tabs.onUpdated.addListener(onUpdateCallback);

//Listen key press for toggle
chrome.commands.onCommand.addListener(handleExtensionToggle);
