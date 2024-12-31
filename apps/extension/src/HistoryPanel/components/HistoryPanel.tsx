import { getHistoryTime } from '@helpers/fetchFromStorage';
import { Header } from '@bypass/shared';
import { Box, Button, Stack } from '@mantine/core';
import { DateTimePicker, DateTimePickerProps } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { FaCalendarCheck } from 'react-icons/fa';
import { MdOutlineDelete } from 'react-icons/md';
import { notifications } from '@mantine/notifications';

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
    leftSection={<FaCalendarCheck />}
    {...props}
  />
);

const HistoryPanel = () => {
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
    getHistoryTime().then((historyStartTime) => {
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
      notifications.show({
        message: "Start date time can't be greater than end date time",
        color: 'red',
      });
      return;
    }
    await chrome.history.deleteRange({
      startTime: startDateTime.valueOf(),
      endTime: endDateTime.valueOf(),
    });
    chrome.storage.local.remove('historyStartTime');
    notifications.show({ message: 'History cleared successfully' });
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
            color="red"
            type="submit"
            leftSection={<MdOutlineDelete />}
          >
            Clear
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default HistoryPanel;
