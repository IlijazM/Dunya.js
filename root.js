const liveServer = require('live-server')

const params = {
    port: 8080,
    host: "0.0.0.0",
    root: "docs",
    open: false,
}

liveServer.start(params)