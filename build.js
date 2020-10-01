const compiler = require('./compiler')

module.exports = async function (args) {
    //#region args
    if (args.srcDir === undefined) args.srcDir = 'src'
    if (args.out === undefined) args.out = 'build'

    if (typeof args.srcDir !== 'string') throw new Error('The argument \'srcDir\' must be a string.')
    if (typeof args.out !== 'string') throw new Error('The argument \'out\' must be a string.')
    //#endregion

    await require('./dev')({ liveServer: false, srcDir: args.srcDir })

    compiler(__dirname + '/dev', args.out, (err) => {
        if (err) return console.error(err)
        console.log('compiled successfully')
        process.exit(0)
    })
}