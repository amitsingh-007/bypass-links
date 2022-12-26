import Header from '@bypass/shared/components/Header';
import historyApi from '@helpers/chrome/history';
import storage from '@helpers/chrome/storage';
import { Box, Button, Flex } from '@mantine/core';
import { TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import useToastStore from '@store/toast';
import dayjs from 'dayjs';
import { memo, useEffect, useState } from 'react';
import { AiOutlineClear } from 'react-icons/ai';
import { DateTimeInputProps } from '../interfaces/historyPanel';

const DateTimeInput = ({ dateTime, onChange, label }: DateTimeInputProps) => (
  <DesktopDateTimePicker
    showToolbar={false}
    ampm={false}
    label={label}
    value={dateTime}
    onChange={onChange}
    maxDateTime={dayjs()}
    renderInput={(props) => (
      <Box py={8}>
        <TextField
          {...props}
          helperText={null}
          variant="outlined"
          color="secondary"
          fullWidth
        />
      </Box>
    )}
  />
);

const HistoryPanel = memo(function HistoryPanel() {
  const displayToast = useToastStore((state) => state.displayToast);
  const [startDateTime, setStartDateTime] = useState<dayjs.Dayjs | null>(
    dayjs()
  );
  const [endDateTime, setEndDateTime] = useState<dayjs.Dayjs | null>(dayjs());

  useEffect(() => {
    storage.get(['historyStartTime']).then(({ historyStartTime }) => {
      if (historyStartTime) {
        setStartDateTime(historyStartTime);
      }
    });
  }, []);

  const handleStartDateTimeChange = (date: dayjs.Dayjs | null) => {
    setStartDateTime(date);
  };

  const handleEndDateTimeChange = (date: dayjs.Dayjs | null) => {
    setEndDateTime(date);
  };

  const handleClear = async () => {
    const startDateNum = startDateTime?.valueOf() ?? 0;
    const endDateNum = endDateTime?.valueOf() ?? 0;
    if (startDateNum > endDateNum) {
      console.log('Start DateTime cannot be more than End DateTime.');
      return;
    }
    await historyApi.deleteRange({
      startTime: startDateNum,
      endTime: endDateNum,
    });
    storage.remove('historyStartTime');
    displayToast({ message: 'History cleared succesfully' });
  };

  return (
    <Box w={321} h={570}>
      <Header text="History Panel" />
      <Flex direction="column" px={15}>
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
      </Flex>
      <Box ta="center" mt={10}>
        <Button
          radius="xl"
          variant="light"
          leftIcon={<AiOutlineClear />}
          onClick={handleClear}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
});

export default HistoryPanel;
