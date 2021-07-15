import { FIREBASE_DB_REF } from "@common/constants/firebase";
import { IconButton, Typography } from "@material-ui/core";
import EventAvailableTwoToneIcon from "@material-ui/icons/EventAvailableTwoTone";
import { getCurrentTab } from "ChromeApi/tabs";
import { IconButtonLoader } from "GlobalComponents/Loader";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import { COLOR } from "GlobalConstants/color";
import { RootState } from "GlobalReducers/rootReducer";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { saveDataToFirebase } from "GlobalUtils/firebase";
import { syncLastVisitedToStorage } from "SrcPath/HomePopup/utils/lastVisited";
import md5 from "md5";
import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { LastVisited } from "../interfaces/lastVisited";
import { getLastVisited } from "SrcPath/helpers/fetchFromStorage";

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
    const lastVisitedDate = lastVisitedObj[md5(hostname)];
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
    await saveDataToFirebase(
      lastVisitedObj,
      FIREBASE_DB_REF.lastVisited,
      syncLastVisitedToStorage
    );
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
