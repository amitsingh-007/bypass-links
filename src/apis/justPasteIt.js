export const getJustPasteItPage = () =>
  fetch(url.href)
    .then((res) => res.text())
    .then((data) => data);
