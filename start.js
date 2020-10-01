module.exports = function (args) {
    if (args.ip === undefined) args.ip = '0.0.0.0'
    if (args.port === undefined) args.port = 8080
    if (args.src === undefined) args.src = 'build'

    if (typeof args.port !== 'number') throw new Error('The argument \'port\' must be a number.')
    if (typeof args.ip !== 'string') throw new Error('The argument \'ip\' must be a string.')
    if (typeof args.src !== 'string') throw new Error('The argument \'src\' must be a string.')

    const liveServer = require('live-server')

    console.log(args)

    const params = {
        port: args.port,
        host: args.ip,
        root: args.src,
        open: false,
    }

    liveServer.start(params)
}
