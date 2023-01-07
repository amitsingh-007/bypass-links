export const getFormattedDateTime = (dateTime: string, country: string) => {
  const date = new Date(dateTime);
  const locale = `en-${country}`;
  return `${date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} ${date.toLocaleTimeString(locale, {
    timeStyle: 'short',
    hour12: false,
  })}`;
};

export const openNewTab = (url: string) => window.open(url, '_blank')?.open();
