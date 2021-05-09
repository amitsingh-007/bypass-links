import history from "ChromeApi/history";
import scripting from "ChromeApi/scripting";

const watchedThreadsPath = "/watched/threads";

const getThreadsOnThePage = () => {
  const titleSuffix = "U29jaWFsIE1lZGlhIEdpcmxzIEZvcnVt";
  return Array.from(
    document.getElementsByClassName("structItem-cell structItem-cell--main")
  ).map((thread) => {
    const threadInfo = thread.getElementsByClassName("structItem-title")[0];
    const category = threadInfo.getElementsByTagName("span")[0]?.innerText;
    const name = threadInfo.getElementsByTagName("a")[0]?.innerText;
    const id = thread.getElementsByTagName("input")[0].value;
    return {
      id,
      title: `${category ? `${category} - ` : ""}${name} | ${atob(
        titleSuffix
      )}`,
    };
  });
};

const highlightThreads = (threads) => {
  threads.forEach(({ id }) => {
    const container = document.getElementsByClassName(
      `js-threadListItem-${id}`
    )[0];
    container.setAttribute("style", "background-color:#151618;");
  });
};

const checkIfVisited = async (title, startTime, endTime) => {
  const results = await history.search({
    text: title,
    startTime: startTime,
    endTime: endTime,
  });
  return results.length > 0;
};

const highlightOpenedUrls = async (tabId) => {
  const curDate = new Date();
  const startTime = curDate.setDate(curDate.getDate() - 1); //last 1 day
  const endTime = Date.now();
  const [allThreads] = await scripting.executeScript(tabId, {
    function: getThreadsOnThePage,
    runAt: "document_end",
  });
  const openedThreads = [];
  for (const thread of allThreads) {
    const isVisited = await checkIfVisited(thread.title, startTime, endTime);
    if (isVisited) {
      openedThreads.push(thread);
    }
  }
  scripting.executeScript(tabId, {
    function: () => {
      highlightThreads(openedThreads);
    },
    runAt: "document_end",
  });
};

export const forumsLogic = async (url, tabId) => {
  if (url.pathname === watchedThreadsPath) {
    highlightOpenedUrls(tabId);
  }
};
