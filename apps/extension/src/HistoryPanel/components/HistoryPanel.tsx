import { Header } from '@bypass/shared';
import { Box, Button, Stack } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import useToastStore from '@store/toast';
import { memo, useEffect } from 'react';
import { AiOutlineClear, AiOutlineClockCircle } from 'react-icons/ai';
import { HiOutlineCalendar } from 'react-icons/hi';
import { combineDateTime, validateDateTime } from '../utils/date';

interface IForm {
  timeRange: Required<any>['value'];
  dateRange: any;
  // timeRange: Required<TimeRangeInputProps>['value'];
  // dateRange: DateRangePickerValue;
}

const currentDate = new Date();

const HistoryPanel = memo(function HistoryPanel() {
  const displayToast = useToastStore((state) => state.displayToast);

  const form = useForm<IForm>({
    initialValues: {
      timeRange: [currentDate, currentDate],
      dateRange: [currentDate, currentDate],
    },
    validate: {
      timeRange: validateDateTime,
      dateRange: validateDateTime,
    },
  });

  useEffect(() => {
    chrome.storage.local
      .get(['historyStartTime'])
      .then(({ historyStartTime }) => {
        if (historyStartTime) {
          form.setFieldValue('timeRange', [
            new Date(historyStartTime),
            currentDate,
          ]);
        }
      });
  }, [form]);

  const handleClear = async (values: typeof form.values) => {
    const [startTime, endTime] = values.timeRange;
    const [startDate, endDate] = values.dateRange;
    if (!startTime || !endTime || !startDate || !endDate) {
      console.log('Something went wrong!!!');
      return;
    }
    const startDateTime = combineDateTime(startTime, startDate);
    const endDateTime = combineDateTime(endTime, endDate);
    if (startDateTime > endDateTime) {
      displayToast({
        message: "Start date time can't be greater than end date time",
        severity: 'error',
      });
      return;
    }
    await chrome.history.deleteRange({
      startTime: startDateTime.valueOf(),
      endTime: endDateTime.valueOf(),
    });
    chrome.storage.local.remove('historyStartTime');
    displayToast({ message: 'History cleared successfully' });
  };

  return (
    <Box w="20.625rem" h="28.75rem">
      <Header text="History Panel" />
      <form onSubmit={form.onSubmit(handleClear)}>
        <Stack p="1rem">
          <DateTimePicker />
          {/* <DateRangePicker
            valueFormat="DD MMM YYYY"
            label="Select start and end date"
            {...form.getInputProps('dateRange')}
            icon={<HiOutlineCalendar />}
            allowSingleDateInRange
            allowLevelChange={false}
            maxDate={currentDate}
          />
          <TimeRangeInput
            label="Select start and end time"
            {...form.getInputProps('timeRange')}
            icon={<AiOutlineClockCircle />}
            format="12"
            clearable
          /> */}
          <Button
            radius="xl"
            variant="light"
            leftIcon={<AiOutlineClear />}
            color="red"
            type="submit"
          >
            Clear
          </Button>
        </Stack>
      </form>
    </Box>
  );
});

export default HistoryPanel;
