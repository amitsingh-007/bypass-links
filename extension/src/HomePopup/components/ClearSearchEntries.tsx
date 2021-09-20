import { Box, Button, SvgIcon } from "@mui/material";
import runtime from "GlobalHelpers/chrome/runtime";
import { getCurrentTab } from "GlobalHelpers/chrome/tabs";
import { RootState } from "GlobalReducers/rootReducer";
import { useCallback, useEffect, useState } from "react";
import { VscSearchStop } from "react-icons/vsc";
import { useSelector } from "react-redux";
import StyledButton from "./StyledButton";

const supportedSites = new Set(["www.google.co.in", "www.google.com"]);

const isSupportedSite = async (url = "") => {
  const hostname = url && new URL(url).hostname;
  return supportedSites.has(hostname);
};

const ClearSearchEntries = () => {
  const [showStopButton, setShowStopButton] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);

  const { isExtensionActive } = useSelector(
    (state: RootState) => state.extension
  );
  const initCurrentTab = async () => {
    const currentTab = await getCurrentTab();
    setCurrentTab(currentTab);
  };
  useEffect(() => {
    initCurrentTab();
  }, []);

  const initIsActive = useCallback(async () => {
    const isActive =
      isExtensionActive && (await isSupportedSite(currentTab?.url));
    setIsActive(isActive);
  }, [currentTab?.url, isExtensionActive]);

  useEffect(() => {
    initIsActive();
  }, [currentTab, initIsActive]);

  const handleClick = async () => {
    setIsFetching(true);
    await runtime.sendMessage<{
      isSuccess: boolean;
    }>({
      clearSearchEntries: currentTab?.id,
    });
  };

  const handleStopClick = async () => {
    const { isSuccess } = await runtime.sendMessage<{
      isSuccess: boolean;
    }>({
      stopClearSearchEntries: currentTab?.id,
    });
    if (isSuccess) {
      setIsFetching(false);
      setShowStopButton(false);
    }
  };

  return (
    <>
      <Box
        onMouseEnter={() => setShowStopButton(true)}
        onMouseLeave={() => setShowStopButton(false)}
        sx={{ position: "relative" }}
      >
        <StyledButton
          showSuccessColor={isActive}
          isLoading={isFetching}
          isDisabled={!isActive}
          onClick={handleClick}
          color="warning"
        >
          <SvgIcon sx={{ transform: "scale(-1, 1)" }}>
            <VscSearchStop />
          </SvgIcon>
        </StyledButton>
        {isFetching && showStopButton && (
          <Button
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              borderRadius: "50%",
              minWidth: "unset",
              height: "50px",
              width: "50px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
            color="error"
            onClick={handleStopClick}
          >
            Stop
          </Button>
        )}
      </Box>
    </>
  );
};

export default ClearSearchEntries;
