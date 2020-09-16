var liveServer = require("live-server")

var params = {
    port: 8080,
    host: "0.0.0.0",
    root: "docs",
    open: false,
}

liveServer.start(params)