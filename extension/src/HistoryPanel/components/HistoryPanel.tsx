import Header from '@bypass/shared/components/Header';
import historyApi from '@helpers/chrome/history';
import storage from '@helpers/chrome/storage';
import { Box, Button, Stack } from '@mantine/core';
import {
  DateRangePicker,
  DateRangePickerValue,
  TimeRangeInput,
  TimeRangeInputProps,
} from '@mantine/dates';
import { useForm } from '@mantine/form';
import useToastStore from '@store/toast';
import dayjs from 'dayjs';
import { memo, useEffect } from 'react';
import { AiOutlineClear, AiOutlineClockCircle } from 'react-icons/ai';
import { HiOutlineCalendar } from 'react-icons/hi';
import { combineDateTime, validateDateTime } from '../utils/date';

interface IForm {
  timeRange: Required<TimeRangeInputProps>['value'];
  dateRange: DateRangePickerValue;
}

const currentDate = dayjs().toDate();

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
    storage.get(['historyStartTime']).then(({ historyStartTime }) => {
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
    await historyApi.deleteRange({
      startTime: startDateTime.valueOf(),
      endTime: endDateTime.valueOf(),
    });
    storage.remove('historyStartTime');
    displayToast({ message: 'History cleared succesfully' });
  };

  return (
    <Box w={330} h={460}>
      <Header text="History Panel" />
      <form onSubmit={form.onSubmit(handleClear)}>
        <Stack p={15}>
          <DateRangePicker
            label="Select start and end date"
            {...form.getInputProps('dateRange')}
            icon={<HiOutlineCalendar />}
            allowSingleDateInRange
            inputFormat="DD MMM YYYY"
            allowLevelChange={false}
            maxDate={currentDate}
          />
          <TimeRangeInput
            label="Select start and end time"
            {...form.getInputProps('timeRange')}
            icon={<AiOutlineClockCircle />}
            format="12"
            clearable
          />
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
