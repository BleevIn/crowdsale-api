var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var log = require("./utils/logger.js");
var app = express();
var deployServ = require('./resource/deployJobService');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
deployServ.startLoop();
var routes = require("./routes/routes.js")(app);

var server = app.listen(3000, function () {
    log.info("Listening on port %s...", server.address().port);
});