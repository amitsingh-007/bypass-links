import { Box, IconButton, TextField } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import DeleteSweepTwoToneIcon from "@material-ui/icons/DeleteSweepTwoTone";
import AdapterDayjs from "@material-ui/lab/AdapterDayjs";
import DesktopDateTimePicker from "@material-ui/lab/DesktopDateTimePicker";
import LocalizationProvider from "@material-ui/lab/LocalizationProvider";
import historyApi from "ChromeApi/history";
import storage from "ChromeApi/storage";
import { displayToast } from "GlobalActionCreators/index";
import { COLOR } from "GlobalConstants/color";
import { ROUTES } from "GlobalConstants/routes";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import PanelHeading from "./PanelHeading";

const DateTimeInput = memo(({ dateTime, onChange, label }) => (
  <DesktopDateTimePicker
    showToolbar={false}
    ampm={false}
    margin="normal"
    label={label}
    value={dateTime}
    onChange={onChange}
    renderInput={(props) => (
      <Box sx={{ paddingY: "8px" }}>
        <TextField
          {...props}
          helperText={null}
          variant="filled"
          color="secondary"
          fullWidth
        />
      </Box>
    )}
    maxDateTime={Date.now()}
  />
));

const ManualHistoryPanel = memo(() => {
  const history = useHistory();
  const dispatch = useDispatch();
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

  const handleClear = async () => {
    if (startDateTime > endDateTime) {
      console.log("Start DateTime cannot be more than End DateTime.");
      return;
    }
    await historyApi.deleteRange({
      startTime: startDateTime,
      endTime: endDateTime,
    });
    storage.remove("historyStartTime");
    dispatch(displayToast({ message: "History cleared succesfully" }));
  };

  return (
    <Box sx={{ width: "321px", height: "570px" }}>
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
      <Box sx={{ display: "flex", flexDirection: "column", paddingX: "15px" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimeInput
            dateTime={startDateTime}
            onChange={handleStartDateTimeChange}
            label="Start Date Time"
          />
          <DateTimeInput
            dateTime={endDateTime}
            onChange={handleEndDateTimeChange}
            label="End Date Time"
          />
        </LocalizationProvider>
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
