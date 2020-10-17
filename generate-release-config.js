const fs = require("fs");

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
  `${date.toLocaleString("en-GB", DATE_OPTIONS)} ${date.toLocaleTimeString(
    "en-US",
    TIME_OPTIONS
  )}`;

const generateReleaseConfig = () => {
  const config = {
    date: getCurFormattedDateTime(new Date()),
  };

  fs.writeFileSync("./src/release-config.json", JSON.stringify(config));
};

generateReleaseConfig();
