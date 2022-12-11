export const getFormattedDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  const locale = 'en-IN';
  return `${date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} ${date.toLocaleTimeString(locale, { timeStyle: 'short' })}`;
};

export const openNewTab = (url: string) => window.open(url, '_blank')?.open();
