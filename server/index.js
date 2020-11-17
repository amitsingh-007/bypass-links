const path = require("path");
const express = require("express");
const app = express();

// add middlewares
app.use(express.static(path.join(__dirname, "..", "extension")));
app.use(express.static("public-extension"));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "extension", "index.html"));
});

app.listen(5000, () => {
  console.log("server started on port 5000");
});
