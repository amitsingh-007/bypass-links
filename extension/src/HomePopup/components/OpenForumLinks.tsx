import { IconButton } from "@material-ui/core";
import ForumTwoToneIcon from "@material-ui/icons/ForumTwoTone";
import runtime from "ChromeApi/runtime";
import tabs, { getCurrentTab } from "ChromeApi/tabs";
import { IconButtonLoader } from "GlobalComponents/Loader";
import { BYPASS_KEYS } from "GlobalConstants";
import { COLOR } from "GlobalConstants/color";
import { RootState } from "GlobalReducers/rootReducer";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { matchHostnames } from "GlobalUtils/common";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startHistoryMonitor } from "SrcPath/HistoryPanel/actionCreators";

const isCurrentPageForum = async (url = "") => {
  const hostname = url && new URL(url).hostname;
  return await matchHostnames(hostname, BYPASS_KEYS.FORUMS);
};

const OpenForumLinks = memo(() => {
  const dispatch = useDispatch();
  const { isSignedIn } = useSelector((state: RootState) => state.root);
  const [isFetching, setIsFetching] = useState(false);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isActive, setIsActive] = useState(false);

  const initCurrentTab = async () => {
    const currentTab = await getCurrentTab();
    setCurrentTab(currentTab);
  };
  useEffect(() => {
    initCurrentTab();
  }, []);

  const initIsActive = useCallback(async () => {
    const isActive = isSignedIn && (await isCurrentPageForum(currentTab?.url));
    setIsActive(isActive);
  }, [currentTab?.url, isSignedIn]);

  useEffect(() => {
    initIsActive();
  }, [isSignedIn, currentTab, initIsActive]);

  const handleClick = async () => {
    setIsFetching(true);
    dispatch(startHistoryMonitor());
    const { forumPageLinks } = await runtime.sendMessage<{
      forumPageLinks: string[];
    }>({
      getForumPageLinks: currentTab?.id,
    });
    forumPageLinks.forEach((url) => {
      tabs.create({ url, selected: false });
    });
    setIsFetching(false);
  };

  if (isFetching) {
    return <IconButtonLoader />;
  }
  return (
    <IconButton
      aria-label="OpenForumLinks"
      component="span"
      style={getActiveDisabledColor(isActive, COLOR.lime)}
      onClick={handleClick}
      title={isActive ? "Open Forum Links" : undefined}
      disabled={!isActive}
    >
      <ForumTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default OpenForumLinks;
