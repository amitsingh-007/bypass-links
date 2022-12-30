export const validateDateTime = (value: [Date | null, Date | null]) => {
  const [startTime, endTime] = value;
  return !startTime || !endTime ? 'Required' : null;
};

export const combineDateTime = (time: Date, date: Date) =>
  new Date(`${date.toDateString()} ${time.toTimeString()}`);
