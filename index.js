const template = require('./template')

template.generate('')

const compiler = require('./compile')

compiler(() => {
    const liveServer = require('live-server')

    const params = {
        port: 8080,
        host: "0.0.0.0",
        root: "docs",
        open: false,
    }

    liveServer.start(params)
})
