const { readdirSync, unlinkSync, statSync } = require("fs");
const { join } = require("path");

const isDir = (path) => {
  try {
    return statSync(path).isDirectory();
  } catch (error) {
    return false;
  }
};

const getFiles = (path) => readdirSync(path).map((name) => join(path, name));

const getDirectories = (path) =>
  readdirSync(path)
    .map((name) => join(path, name))
    .filter(isDir);

const removeDir = (dir) => {
  try {
    getDirectories(dir).map((dir) => removeDir(dir));
    getFiles(dir).map((file) => unlinkSync(file));
  } catch (err) {
    console.error(`Error while deleting ${dir}.`, err);
  }
};

module.exports = {
  removeDir: removeDir,
};
