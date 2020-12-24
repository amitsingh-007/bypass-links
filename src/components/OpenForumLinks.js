import { IconButton } from "@material-ui/core";
import ForumTwoToneIcon from "@material-ui/icons/ForumTwoTone";
import runtime from "ChromeApi/runtime";
import tabs, { getCurrentTab } from "ChromeApi/tabs";
import { startHistoryMonitor } from "GlobalActionCreators/index";
import { COLOR } from "GlobalConstants/color";
import { BYPASS_KEYS } from "GlobalConstants/index";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { getHostnameAlias } from "GlobalUtils/common";
import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButtonLoader } from "./Loader";

const isCurrentPageForum = async (url) => {
  const hostname = url && new URL(url).hostname;
  return (await getHostnameAlias(hostname)) === BYPASS_KEYS.FORUMS;
};

const OpenForumLinks = memo(() => {
  const dispatch = useDispatch();
  const isSignedIn = useSelector((state) => state.isSignedIn);
  const [isFetching, setIsFetching] = useState(false);
  const [currentTab, setCurrentTab] = useState({});
  const [isActive, setIsActive] = useState(false);

  const initCurrentTab = async () => {
    const [currentTab] = await getCurrentTab();
    setCurrentTab(currentTab);
  };
  useEffect(() => {
    initCurrentTab();
  }, []);

  const initIsActive = async () => {
    const isActive = isSignedIn && (await isCurrentPageForum(currentTab.url));
    setIsActive(isActive);
  };
  useEffect(() => {
    initIsActive();
  }, [isSignedIn]);

  const handleClick = async () => {
    setIsFetching(true);
    dispatch(startHistoryMonitor());
    const { forumPageLinks } = await runtime.sendMessage({
      getForumPageLinks: currentTab.id,
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
