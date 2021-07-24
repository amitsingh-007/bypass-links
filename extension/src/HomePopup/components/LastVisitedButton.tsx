import { IconButton, Typography } from "@material-ui/core";
import EventAvailableTwoToneIcon from "@material-ui/icons/EventAvailableTwoTone";
import { IconButtonLoader } from "GlobalComponents/Loader";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import { COLOR } from "GlobalConstants/color";
import { getCurrentTab } from "GlobalHelpers/chrome/tabs";
import { getLastVisited } from "GlobalHelpers/fetchFromStorage";
import { RootState } from "GlobalReducers/rootReducer";
import { getActiveDisabledColor } from "GlobalUtils/color";
import md5 from "md5";
import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { syncLastVisitedToStorage } from "SrcPath/HomePopup/utils/lastVisited";
import { saveLastVisited } from "../apis/lastVisited";
import { LastVisited } from "../interfaces/lastVisited";

const tooltipStyles = { fontSize: "13px" };

const LastVisitedButton = memo(() => {
  const { isSignedIn } = useSelector((state: RootState) => state.root);
  const [isFetching, setIsFetching] = useState(false);
  const [lastVisited, setLastVisited] = useState("");
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [lastVisitedObj, setLastVisitedObj] = useState<LastVisited>({});

  const initLastVisited = async () => {
    setIsFetching(true);
    const lastVisitedObj = await getLastVisited();
    const currentTab = await getCurrentTab();
    const { hostname } = new URL(currentTab.url ?? "");
    const lastVisitedDate = lastVisitedObj[hostname];
    let displayInfo = "";
    if (lastVisitedDate) {
      const date = new Date(lastVisitedDate);
      displayInfo = `${date.toDateString()}, ${date.toLocaleTimeString()}`;
    }
    setLastVisited(displayInfo);
    setLastVisitedObj(lastVisitedObj);
    setCurrentTab(currentTab);
    setIsFetching(false);
  };

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    initLastVisited();
  }, [isSignedIn, lastVisited]);

  const handleUpdateLastVisited = async () => {
    setIsFetching(true);
    const { hostname } = new URL(currentTab?.url ?? "");
    lastVisitedObj[md5(hostname)] = Date.now();
    await saveLastVisited({ hostname, visitedOn: new Date().toISOString() });
    await syncLastVisitedToStorage();
    setIsFetching(false);
    initLastVisited();
  };

  if (isFetching) {
    return <IconButtonLoader />;
  }

  return (
    <BlackTooltip
      title={
        <Typography style={tooltipStyles}>
          {lastVisited || "No last updated date"}
        </Typography>
      }
      arrow
      disableInteractive
    >
      <IconButton
        component="span"
        style={getActiveDisabledColor(isSignedIn, COLOR.brown)}
        onClick={handleUpdateLastVisited}
        disabled={!isSignedIn}
      >
        <EventAvailableTwoToneIcon fontSize="large" />
      </IconButton>
    </BlackTooltip>
  );
});

export default LastVisitedButton;
