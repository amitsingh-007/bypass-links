import { Box, IconButton, TextField } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import DeleteSweepTwoToneIcon from "@material-ui/icons/DeleteSweepTwoTone";
import AdapterDayjs from "@material-ui/lab/AdapterDayjs";
import DesktopDateTimePicker from "@material-ui/lab/DesktopDateTimePicker";
import LocalizationProvider from "@material-ui/lab/LocalizationProvider";
import historyApi from "GlobalHelpers/chrome/history";
import storage from "GlobalHelpers/chrome/storage";
import { displayToast } from "GlobalActionCreators/toast";
import PanelHeading from "GlobalComponents/PanelHeading";
import { BG_COLOR_DARK, COLOR } from "GlobalConstants/color";
import { ROUTES } from "GlobalConstants/routes";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { DateTimeInputProps } from "../interfaces/historyPanel";

const DateTimeInput = ({ dateTime, onChange, label }: DateTimeInputProps) => (
  <DesktopDateTimePicker
    showToolbar={false}
    ampm={false}
    label={label}
    value={dateTime}
    onChange={onChange}
    renderInput={(props) => (
      <Box sx={{ paddingY: "8px" }}>
        <TextField
          {...props}
          helperText={null}
          variant="outlined"
          color="secondary"
          fullWidth
        />
      </Box>
    )}
    // Not working. Check: https://github.com/mui-org/material-ui/pull/27392
    // maxDateTime={new Date()}
  />
);

const HistoryPanel = memo(function HistoryPanel() {
  const history = useHistory();
  const dispatch = useDispatch();
  const [startDateTime, setStartDateTime] = useState<Date | null>(new Date());
  const [endDateTime, setEndDateTime] = useState<Date | null>(new Date());

  useEffect(() => {
    storage.get(["historyStartTime"]).then(({ historyStartTime }) => {
      if (historyStartTime) {
        setStartDateTime(historyStartTime);
      }
    });
  }, []);

  const handleStartDateTimeChange = (date: Date | null) => {
    setStartDateTime(date);
  };

  const handleEndDateTimeChange = (date: Date | null) => {
    setEndDateTime(date);
  };

  const handleClose = () => {
    history.push(ROUTES.HOMEPAGE);
  };

  const handleClear = async () => {
    const startDateNum = startDateTime?.valueOf() ?? 0;
    const endDateNum = endDateTime?.valueOf() ?? 0;
    if (startDateNum > endDateNum) {
      console.log("Start DateTime cannot be more than End DateTime.");
      return;
    }
    await historyApi.deleteRange({
      startTime: startDateNum,
      endTime: endDateNum,
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
          backgroundColor: BG_COLOR_DARK,
          py: "4px",
          px: "2px",
          marginBottom: "10px",
        }}
      >
        <IconButton
          size="small"
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

export default HistoryPanel;
