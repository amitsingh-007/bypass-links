const executeScript = (async (options) => {
  try {
    return await browser.scripting.executeScript(options);
  } catch (error) {
    console.error('executeScript error with options', options, error);
    throw error;
  }
}) satisfies typeof browser.scripting.executeScript;

const scripting = {
  executeScript,
};

export default scripting;
