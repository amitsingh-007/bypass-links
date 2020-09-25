var file_system = require("fs");
var archiver = require("archiver");
const path = require("path");

var output = file_system.createWriteStream("./build/bypass-links.zip");
var archive = archiver("zip");

output.on("close", function () {
  console.log(archive.pointer() + " total bytes");
  console.log(
    "archiver has been finalized and the output file descriptor has closed."
  );
});

archive.on("error", function (err) {
  throw err;
});

archive.pipe(output);

archive.directory(path.resolve(__dirname, "extension"), false);
archive.finalize();
