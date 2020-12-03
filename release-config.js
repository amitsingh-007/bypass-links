const manifest = require("./public-extension/manifest.json");

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

exports.getReleaseConfig = () => ({
  __RELEASE_DATE__: getCurFormattedDateTime(new Date()),
  __EXT_VERSION__: manifest.version,
});
