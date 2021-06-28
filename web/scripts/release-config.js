const manifest = require("../../extension/assets/manifest.json");

const DATE_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
};
const TIME_OPTIONS = {
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
};

const getCurFormattedDateTime = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 2);
  return `${date.toLocaleString(
    "en-IN",
    DATE_OPTIONS
  )} ${date.toLocaleTimeString("en-IN", TIME_OPTIONS)}`;
};

module.exports = {
  releaseDate: getCurFormattedDateTime(),
  extVersion: manifest.version,
};
