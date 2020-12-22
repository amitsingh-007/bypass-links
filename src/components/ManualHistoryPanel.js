import DateFnsUtils from "@date-io/date-fns";
import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import DeleteSweepTwoToneIcon from "@material-ui/icons/DeleteSweepTwoTone";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import history from "ChromeApi/history";
import storage from "ChromeApi/storage";
import { hideManualHistoryPanel } from "GlobalActionCreators/index";
import { COLOR } from "GlobalConstants/color";
import React, { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import PanelHeading from "./PanelHeading";

const ManualHistoryPanel = memo(() => {
  const dispatch = useDispatch();
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());

  useEffect(() => {
    storage.get(["historyStartTime"]).then(({ historyStartTime }) => {
      if (historyStartTime) {
        setStartDateTime(new Date(historyStartTime));
      }
    });
  });

  const handleStartDateTimeChange = (date) => {
    setStartDateTime(date);
  };

  const handleEndDateTimeChange = (date) => {
    setEndDateTime(date);
  };

  const handleClose = () => {
    dispatch(hideManualHistoryPanel());
  };

  const handleClear = () => {
    const startTime = startDateTime.getTime();
    const endTime = endDateTime.getTime();
    if (startTime > endTime) {
      console.log("Start DateTim cannot be more than End DateTime.");
      return;
    }
    history
      .deleteRange({
        startTime,
        endTime,
      })
      .then(() => {
        storage.remove("historyStartTime");
        console.log("History clear succesful.");
        handleClose();
      });
  };

  return (
    <Box width="335px" height="430px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton
          aria-label="Back"
          component="span"
          style={COLOR.blue}
          onClick={handleClose}
          title="Back"
        >
          <ArrowBackTwoToneIcon fontSize="large" />
        </IconButton>
        <PanelHeading heading="HISTORY PANEL" />
      </Box>
      <Box display="flex" flexDirection="column" paddingX="20px">
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DateTimePicker
            disableToolbar
            ampm={false}
            inputVariant="filled"
            margin="normal"
            label="Start Date Time"
            value={startDateTime}
            onChange={handleStartDateTimeChange}
          />
          <DateTimePicker
            disableToolbar
            ampm={false}
            inputVariant="filled"
            margin="normal"
            label="End Date Time"
            value={endDateTime}
            onChange={handleEndDateTimeChange}
          />
        </MuiPickersUtilsProvider>
      </Box>
      <Box textAlign="center">
        <IconButton
          aria-label="Clear"
          component="span"
          style={COLOR.red}
          onClick={handleClear}
          title="Clear"
        >
          <DeleteSweepTwoToneIcon fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
});

export default ManualHistoryPanel;
