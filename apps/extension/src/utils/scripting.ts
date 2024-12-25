const executeScript = (async (options) => {
  try {
    return await chrome.scripting.executeScript(options);
  } catch (error) {
    console.error('executeScript error with options', options, error);
    throw error;
  }
}) satisfies typeof chrome.scripting.executeScript;

const scripting = {
  executeScript,
};

export default scripting;
