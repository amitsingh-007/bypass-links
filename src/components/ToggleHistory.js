import { Box, Switch } from "@material-ui/core";
import VisibilityOffTwoToneIcon from "@material-ui/icons/VisibilityOffTwoTone";
import VisibilityTwoToneIcon from "@material-ui/icons/VisibilityTwoTone";
import React, { memo, useEffect, useState } from "react";
import history from "../scripts/chrome/history";
import storage from "../scripts/chrome/storage";
import { getOffIconColor, getOnIconColor } from "../utils/color";

const startHistoryWatch = async () =>
  storage.set({ historyStartTime: Date.now() });

export const endHistoryWatch = async () => {
  const { historyStartTime } = await storage.get(["historyStartTime"]);
  const historyEndTime = Date.now();
  console.log(`Start DateTime is: ${new Date(historyStartTime)}`);
  console.log(`End DateTime is: ${new Date(historyEndTime)}`);
  await history.deleteRange({
    startTime: historyStartTime,
    endTime: historyEndTime,
  });
  storage.remove("historyStartTime");
  console.log("History clear succesful.");
};

export const ToggleHistory = memo(() => {
  const [isHistoryActive, setIsHistoryActive] = useState(false);

  useEffect(() => {
    storage.get(["historyStartTime"]).then(({ historyStartTime }) => {
      setIsHistoryActive(!!historyStartTime);
    });
  }, []);

  const handleToggle = async (event) => {
    const isActive = event.target.checked;
    const historyFn = isActive ? startHistoryWatch : endHistoryWatch;
    await historyFn();
    setIsHistoryActive(isActive);
  };

  return (
    <Box display="flex" alignItems="center">
      <VisibilityOffTwoToneIcon htmlColor={getOffIconColor(isHistoryActive)} />
      <Switch
        checked={isHistoryActive}
        onChange={handleToggle}
        color="primary"
        name="historyWatch"
      />
      <VisibilityTwoToneIcon htmlColor={getOnIconColor(isHistoryActive)} />
    </Box>
  );
});
