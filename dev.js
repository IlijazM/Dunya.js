const fs = require('fs')
const template = fs.readFileSync('template.html', 'utf-8')

const template_ = require('./template')
template_.generate('src', '', template)

const liveServer = require('live-server')

const params = {
    port: 8080,
    host: "0.0.0.0",
    root: "src",
    open: false,
}

liveServer.start(params)
