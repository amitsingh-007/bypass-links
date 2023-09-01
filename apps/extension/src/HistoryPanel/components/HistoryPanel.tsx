import { Header } from '@bypass/shared';
import { Box, Button, Stack } from '@mantine/core';
import { DateTimePicker, DateTimePickerProps } from '@mantine/dates';
import { useForm } from '@mantine/form';
import useToastStore from '@store/toast';
import { memo, useEffect } from 'react';
import { AiOutlineClear, AiOutlineClockCircle } from 'react-icons/ai';

interface IForm {
  startDateTime: Date;
  endDateTime: Date;
}

const currentDate = new Date();

const DateTime = (props: DateTimePickerProps) => (
  <DateTimePicker
    valueFormat="hh:mm A DD MMM YYYY"
    maxDate={new Date()}
    withAsterisk
    level="month"
    hasNextLevel={false}
    icon={<AiOutlineClockCircle />}
    {...props}
  />
);

const HistoryPanel = memo(function HistoryPanel() {
  const displayToast = useToastStore((state) => state.displayToast);

  const form = useForm<IForm>({
    initialValues: {
      startDateTime: currentDate,
      endDateTime: currentDate,
    },
    validate: {
      startDateTime: (value, values) =>
        value > values.endDateTime
          ? "Start date time can't be greater than end date time"
          : null,
    },
  });

  useEffect(() => {
    chrome.storage.local
      .get(['historyStartTime'])
      .then(({ historyStartTime }) => {
        if (historyStartTime) {
          form.setFieldValue('startDateTime', new Date(historyStartTime));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClear = async (values: typeof form.values) => {
    const { startDateTime, endDateTime } = values;
    if (!startDateTime || !endDateTime) {
      throw new Error('start/end date time not found');
    }
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
    <Box w={324} h={570}>
      <Header text="History Panel" />
      <form onSubmit={form.onSubmit(handleClear)}>
        <Stack p="1rem">
          <DateTime
            label="Select start date/time"
            {...form.getInputProps('startDateTime')}
          />
          <DateTime
            label="Select end date/time"
            {...form.getInputProps('endDateTime')}
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
