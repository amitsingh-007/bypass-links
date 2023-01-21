import ct from 'countries-and-timezones';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getFormattedDateTime = (dateTime: string, country: string) => {
  const data = ct.getCountry(country);
  const tz = data?.timezones[0];
  console.log(tz);
  console.log(dayjs(dateTime).tz(tz).format('DD MMMM YYYY HH:MM Z'));
  return dayjs(dateTime).tz(tz).format('DD MMMM YYYY hh:mm A');
  // const date = new Date(dateTime);
  // const locale = `en-${country}`;
  // return `${date.toLocaleDateString(locale, {
  //   year: 'numeric',
  //   month: 'long',
  //   day: 'numeric',
  // })} ${date.toLocaleTimeString(locale, {
  //   timeStyle: 'short',
  //   hour12: false,
  // })}`;
};

export const openNewTab = (url: string) => window.open(url, '_blank')?.open();
