/**
 * @link https://github.com/w3c/webextensions/issues/72#issuecomment-1379374344
 * NOTE: Call the function at SW start
 */

// Forcing service worker to stay alive by sending a "ping" to a port where no one is listening
// Essentially it prevents SW to fall asleep after the first 30 secs of work.

const INTERNAL_STAYALIVE_PORT = 'BYPASS_LINKS_STAYALIVE';
const STAYALIVE_POLL_INTERVAL = 25 * 1000; // We have to check every 25 secs since background page is killed after 30 secs

let alivePort: chrome.runtime.Port | null = null;

const hearbeatFirefoxBackgroundPage = () => {
  setInterval(() => {
    if (alivePort === null) {
      alivePort = chrome.runtime.connect({ name: INTERNAL_STAYALIVE_PORT });

      alivePort.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
          console.error(
            `Port disconnected due to an error: ${chrome.runtime.lastError.message}`
          );
        } else {
          console.error(`Port disconnected`);
        }

        alivePort = null;
      });
    }

    if (alivePort) {
      alivePort.postMessage({ content: 'ping' });
      if (chrome.runtime.lastError) {
        console.error(`PostMessage error: ${chrome.runtime.lastError.message}`);
      }
    }
  }, STAYALIVE_POLL_INTERVAL);
};

export default hearbeatFirefoxBackgroundPage;
