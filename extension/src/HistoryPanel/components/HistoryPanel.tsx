import { Box, Button, TextField } from "@mui/material";
import AdapterDayjs from "@mui/lab/AdapterDayjs";
import DesktopDateTimePicker from "@mui/lab/DesktopDateTimePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { displayToast } from "GlobalActionCreators/toast";
import PanelHeading from "GlobalComponents/PanelHeading";
import { BG_COLOR_DARK } from "GlobalConstants/color";
import { ROUTES } from "GlobalConstants/routes";
import historyApi from "GlobalHelpers/chrome/history";
import storage from "GlobalHelpers/chrome/storage";
import { memo, useEffect, useState } from "react";
import { AiOutlineClear } from "react-icons/ai";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
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
    //! Note: Not working. Check: https://github.com/mui-org/material-ui/pull/27392
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
          py: "8px",
          pl: "10px",
          pr: "2px",
          mb: "10px",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<HiOutlineArrowNarrowLeft />}
          onClick={handleClose}
          size="small"
          color="error"
        >
          Back
        </Button>
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
      <Box sx={{ textAlign: "center", mt: "10px" }}>
        <Button
          variant="outlined"
          startIcon={<AiOutlineClear />}
          onClick={handleClear}
          size="small"
          color="error"
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
});

export default HistoryPanel;
