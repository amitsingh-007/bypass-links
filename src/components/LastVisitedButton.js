import { IconButton, Typography } from "@material-ui/core";
import EventAvailableTwoToneIcon from "@material-ui/icons/EventAvailableTwoTone";
import { getCurrentTab } from "ChromeApi/tabs";
import { COLOR } from "GlobalConstants/color";
import { FIREBASE_DB_REF } from "GlobalConstants/index";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { saveDataToFirebase } from "GlobalUtils/firebase";
import {
  getLastVisitedObj,
  syncLastVisitedToStorage,
} from "GlobalUtils/lastVisited";
import md5 from "md5";
import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IconButtonLoader } from "./Loader";
import { BlackTooltip } from "./StyledComponents";

const tooltipStyles = { fontSize: "13px" };

const LastVisitedButton = memo(() => {
  const isSignedIn = useSelector((state) => state.isSignedIn);
  const [isFetching, setIsFetching] = useState(false);
  const [lastVisited, setLastVisited] = useState(null);
  const [currentTab, setCurrentTab] = useState(null);
  const [lastVisitedObj, setLastVisitedObj] = useState(null);

  const initLastVisited = async () => {
    setIsFetching(true);
    const lastVisitedObj = await getLastVisitedObj();
    const currentTab = await getCurrentTab();
    const { hostname } = new URL(currentTab.url);
    const lastVisitedDate = lastVisitedObj[md5(hostname)];
    let displayInfo = null;
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
    const { hostname } = new URL(currentTab.url);
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
          {lastVisited ?? "No last updated date"}
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
