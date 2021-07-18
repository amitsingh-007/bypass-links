import history from "GlobalHelpers/chrome/history";
import scripting from "GlobalHelpers/chrome/scripting";

interface Thread {
  id: string;
  title: string;
}

const watchedThreadsPath = "/watched/threads";

const getThreadsOnThePage = (): Thread[] => {
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

const highlightThreads = (threads: Thread[]) => {
  threads.forEach(({ id }) => {
    const container = document.getElementsByClassName(
      `js-threadListItem-${id}`
    )[0];
    container.setAttribute("style", "background-color:#151618;");
  });
};

const checkIfVisited = async (
  title: string,
  startTime: number,
  endTime: number
) => {
  const results = await history.search({
    text: title,
    startTime: startTime,
    endTime: endTime,
  });
  return results.length > 0;
};

const highlightOpenedUrls = async (tabId: number) => {
  const curDate = new Date();
  const startTime = curDate.setDate(curDate.getDate() - 1); //last 1 day
  const endTime = Date.now();
  const response = await scripting.executeScript({
    target: { tabId },
    function: getThreadsOnThePage,
  });
  const result: Thread[] = response[0].result;
  const openedThreads: Thread[] = [];
  for (const thread of result) {
    const isVisited = await checkIfVisited(thread.title, startTime, endTime);
    if (isVisited) {
      openedThreads.push(thread);
    }
  }
  scripting.executeScript({
    target: { tabId },
    function: () => {
      highlightThreads(openedThreads);
    },
  });
};

export const forumsLogic = async (url: URL, tabId: number) => {
  if (url.pathname === watchedThreadsPath) {
    highlightOpenedUrls(tabId);
  }
};
