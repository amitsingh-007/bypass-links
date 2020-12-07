const manifest = require("./assets/manifest.json");

const DATE_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
};
const TIME_OPTIONS = {
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
};

const getCurFormattedDateTime = (date) =>
  `${date.toLocaleString("en-IN", DATE_OPTIONS)} ${date.toLocaleTimeString(
    "en-IN",
    TIME_OPTIONS
  )}`;

module.exports = {
  releaseDate: getCurFormattedDateTime(new Date()),
  extVersion: manifest.version,
};
