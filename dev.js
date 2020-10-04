//#region Imports
const fs = require('fs-extra')
const glob = require("glob")
//#endregion

module.exports = async function (args) {
    const { args, config, template, props } = variableInitiation(args)

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

//#region Variable initiation
async function variableInitiation(args) {
    const config = await loadConfig(args.config)
    overwriteConfigArguments(args, config)
    defaultArguments(args)
    argumentValidation(args)
}

function argumentConfigSetup() {

}

function argumentValidation(args) {
    args = args ?? {}
    if (args.config === undefined) args.config = 'dunya.config.json'

    if (typeof args.port !== 'number') throw new Error('The argument \'port\' must be a number.')
    if (typeof args.ip !== 'string') throw new Error('The argument \'ip\' must be a string.')

    if (typeof args.srcDir !== 'string') throw new Error('The argument \'srcDir\' must be a string.')
    if (typeof args.devDir !== 'string') throw new Error('The argument \'devDir\' must be a string.')

    if (typeof args.templatePath !== 'string') throw new Error('The argument \'templatePath\' must be a string.')
    if (typeof args.props !== 'string') throw new Error('The argument \'props\' must be a string.');

    [args.srcDir, args.templatePath].forEach(path => {
        if (!fs.pathExistsSync(path)) throw new Error(`Missing '${path}'.`)
    })
}

function defaultArguments(args) {
    if (args.ip === undefined) args.ip = '0.0.0.0'
    if (args.port === undefined) args.port = 8080

    if (args.srcDir === undefined) args.srcDir = 'src'
    if (args.devDir === undefined) args.devDir = __dirname + '/dev'

    if (args.templatePath === undefined) args.templatePath = args.srcDir + '/template.html'
    if (args.propsPath === undefined) args.propsPath = 'props.json'

    if (args.liveServer === undefined) args.liveServer = true
}

async function loadConfig(path) {
    try {
        return JSON.parse(await fs.readFile(path))
    } catch (err) {
        throw new Error(`An error occurred while parsing '${args.configPath}':\n${err}`)
    }
}

function overwriteConfigArguments(args, config) {
    ['ip', 'port', 'srcDir', 'devDir', 'templatePath', 'props', 'liveServer']
    if (config.ip === undefined) args.ip = config.ip
    if (config.port === undefined) args.port = config.port
    if (config.srcDir === undefined) args.srcDir = config.srcDir
    if (config.devDir === undefined) args.devDir = config.devDir
    if (config.templatePath === undefined) args.templatePath = config.templatePath
    if (config.props === undefined) args.props = config.props
}

async function loadTemplate(path) {
    return await fs.readFile(path)
}
//#endregion

