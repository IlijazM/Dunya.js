const compiler = require('./compiler')

const liveServer = require('live-server')

const params = {
    port: 8080,
    host: "0.0.0.0",
    root: "docs",
    open: false,
}


compiler('src', 'docs', () => {
    liveServer.start(params)
})
