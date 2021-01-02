import DateFnsUtils from "@date-io/dayjs";
import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import DeleteSweepTwoToneIcon from "@material-ui/icons/DeleteSweepTwoTone";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import storage from "ChromeApi/storage";
import historyApi from "ChromeApi/history";
import { COLOR } from "GlobalConstants/color";
import { ROUTES } from "GlobalConstants/routes";
import React, { memo, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import PanelHeading from "./PanelHeading";

const ManualHistoryPanel = memo(() => {
  const history = useHistory();
  const [startDateTime, setStartDateTime] = useState(Date.now());
  const [endDateTime, setEndDateTime] = useState(Date.now());

  useEffect(() => {
    storage.get(["historyStartTime"]).then(({ historyStartTime }) => {
      if (historyStartTime) {
        setStartDateTime(new Date(historyStartTime));
      }
    });
  });

  const handleStartDateTimeChange = (date) => {
    setStartDateTime(date.valueOf());
  };

  const handleEndDateTimeChange = (date) => {
    setEndDateTime(date.valueOf());
  };

  const handleClose = () => {
    history.push(ROUTES.HOMEPAGE);
  };

  const handleClear = () => {
    const startTime = startDateTime;
    const endTime = endDateTime;
    if (startTime > endTime) {
      console.log("Start DateTim cannot be more than End DateTime.");
      return;
    }
    historyApi
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
    <Box sx={{ width: "335px", height: "430px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
      <Box sx={{ display: "flex", flexDirection: "column", paddingX: "20px" }}>
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
      <Box sx={{ textAlign: "center" }}>
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
