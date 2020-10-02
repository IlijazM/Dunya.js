//#region Imports
const fs = require('fs-extra')
const glob = require("glob")
//#endregion

module.exports = async function (args) {
    //#region Variable initiation

    //#region Args
    args = args || {}


    if (args.ip === undefined) args.ip = '0.0.0.0'
    if (args.port === undefined) args.port = 8080

    if (args.srcDir === undefined) args.srcDir = 'src'
    if (args.devDir === undefined) args.devDir = __dirname + '/dev'


    if (args.configPath === undefined) args.configPath = 'dunya.config.json'
    if (args.templatePath === undefined) args.templatePath = args.srcDir + '/template.html'
    if (args.propsPath === undefined) args.propsPath = 'props.json'

    if (args.liveServer === undefined) args.liveServer = true

    argumentValidation(args)
    //#endregion

    //#region Variables
    let config
    try {
        config = JSON.parse(await fs.readFile(args.configPath))
    } catch (err) {
        throw new Error(`An error occurred while parsing '${args.configPath}':\n${err}`)
    }

    const template = await fs.readFile(args.templatePath)

    let props
    try {
        props = JSON.parse(await fs.readFile(args.propsPath))
    } catch (err) {
        throw new Error(`An error occurred while parsing '${args.propsPath}':\n${err}`)
    }


    //#endregion

    //#region Plugins
    if (config.plugins !== undefined && config.plugins instanceof Array) {
        for (let plugin of config.plugins) {
            if (typeof plugin !== 'string') continue // ignore

            try {
                const plugin_module = require(plugin)
            } catch (err) {
                throw new Error(`An error occurred with the plugin '${plugin}':\n${err}`)
            }
        }
    }
    //#endregion

    //#endregion

    //#region Compiler
    //#endregion

    //#region Event handler
    function eventHandler(event, path) {

    }
    //#endregion

    //#region Setup
    await fs.emptyDir(args.devDir) // It automatically makes a directory as well.
    //#endregion

    //#region Watcher
    const chokidar = require('chokidar')

    const watcher = chokidar.watch(args.srcDir, {
        ignoreInitial: true
    })
    watcher.on('all', eventHandler)
    //#endregion

    //#region After setup
    // add all
    const allDirs = glob.sync(args.srcDir + '/**/*')
        .sort((a, b) => {

        })
    //#endregion

    //#region Server
    //#endregion

}

//#region Validation
function argumentValidation(args) {
    //#region Validate types

    if (typeof args.port !== 'number') throw new Error('The argument \'port\' must be a number.')
    if (typeof args.ip !== 'string') throw new Error('The argument \'ip\' must be a string.')

    if (typeof args.srcDir !== 'string') throw new Error('The argument \'srcDir\' must be a string.')
    if (typeof args.devDir !== 'string') throw new Error('The argument \'devDir\' must be a string.')

    if (typeof args.configPath !== 'string') throw new Error('The argument \'configPath\' must be a string.')
    if (typeof args.templatePath !== 'string') throw new Error('The argument \'templatePath\' must be a string.')
    if (typeof args.propsPath !== 'string') throw new Error('The argument \'props\' must be a string.');
    //#endregion

    //#region Validate files
    [args.configPath, args.srcDir, args.templatePath, args.propsPath].forEach(path => {
        if (!fs.pathExistsSync(path)) throw new Error(`Missing '${path}'.`)
    })
    //#endregion
}
//#endregion
