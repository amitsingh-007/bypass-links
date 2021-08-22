import { FIREBASE_DB_REF } from "@common/constants/firebase";
import { Typography } from "@material-ui/core";
import EventAvailableTwoToneIcon from "@material-ui/icons/EventAvailableTwoTone";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import { getCurrentTab } from "GlobalHelpers/chrome/tabs";
import { getLastVisited } from "GlobalHelpers/fetchFromStorage";
import { saveToFirebase } from "GlobalHelpers/firebase/database";
import { RootState } from "GlobalReducers/rootReducer";
import md5 from "md5";
import { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { syncLastVisitedToStorage } from "SrcPath/HomePopup/utils/lastVisited";
import { LastVisited } from "../interfaces/lastVisited";
import StyledButton from "./StyledButton";

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
    const isSuccess = await saveToFirebase(
      FIREBASE_DB_REF.lastVisited,
      lastVisitedObj
    );
    if (isSuccess) {
      syncLastVisitedToStorage();
    }
    setIsFetching(false);
    initLastVisited();
  };

  return (
    <StyledButton
      showSuccessColor={isSignedIn}
      isLoading={isFetching}
      isDisabled={!isSignedIn}
      onClick={handleUpdateLastVisited}
    >
      <BlackTooltip
        title={
          <Typography style={tooltipStyles}>
            {lastVisited || "No last updated date"}
          </Typography>
        }
        arrow
        disableInteractive
      >
        <EventAvailableTwoToneIcon />
      </BlackTooltip>
    </StyledButton>
  );
});

export default LastVisitedButton;
