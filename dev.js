const ts = require('typescript')
async function compileTypescript(tsCode) {
    return await ts.transpileModule(tsCode, {}).outputText
}

const sass = require('node-sass')
async function compileSass(sassCode) {
    return await sass.render({
        data: sassCode
    })
}

module.exports = function (args) {
    if (args.ip === undefined) args.ip = '0.0.0.0'
    if (args.port === undefined) args.port = 8080
    if (args.srcDir === undefined) args.srcDir = 'src'
    if (args.devDir === undefined) args.devDir = 'dev'
    if (args.template === undefined) args.template = 'template.html'

    if (typeof args.port !== 'number') throw new Error('The argument \'port\' must be a number.')
    if (typeof args.ip !== 'string') throw new Error('The argument \'ip\' must be a string.')
    if (typeof args.srcDir !== 'string') throw new Error('The argument \'srcDir\' must be a string.')
    if (typeof args.devDir !== 'string') throw new Error('The argument \'devDir\' must be a string.')
    if (typeof args.template !== 'string') throw new Error('The argument \'template\' must be a string.')

    const fs = require('fs-extra')
    const glob = require("glob")

    //#region template
    const template_ = require('./template')
    const template = fs.readFileSync(args.template, 'utf-8')
    //#endregion

    //#region live-server
    const liveServer = require('live-server')

    const params = {
        port: args.port,
        host: args.ip,
        root: args.devDir,
        open: false,
    }

    liveServer.start(params)
    //#endregion

    async function reServe(event, filename) {
        try {
            await fs.emptyDir(args.devDir)
            await fs.copy(args.srcDir, args.devDir)

            try {
                await fs.copy(args.devDir + '/dev', args.devDir + '/active')
            } catch (err) { }

            glob(args.devDir + '/**/*.ts', (err, files) => {
                files.forEach(async (file) => {
                    const code = await fs.readFile(file, 'utf-8')
                    const compiledCode = await compileTypescript(code)
                    await fs.writeFile(file, compiledCode)
                    await fs.rename(file, file.substr(0, file.length - 2) + 'js')
                })
            })

            glob(args.devDir + '/**/*.scss', (err, files) => {
                files.forEach(async (file) => {
                    const code = await fs.readFile(file, 'utf-8')
                    const compiledCode = await compileSass(code)
                    // console.log(compiledCode)
                    // await fs.writeFile(file, compiledCode)
                    // await fs.rename(file, file.substr(0, file.length - 4) + 'css')
                })
            })
        } catch {

        }
    }

    reServe()

    //#region watcher
    fs.mkdirSync(args.srcDir, { recursive: true }, (err) => { })

    const chokidar = require('chokidar')

    const watcher = chokidar.watch(args.srcDir, { ignored: /^\./, persistent: true })

    watcher
        .on('add', function (path) { reServe(path) })
        .on('change', function (path) { reServe(path) })
        .on('unlink', function (path) { reServe(path) })
        .on('error', function (error) { reServe(path) })
    //#endregion
}

// ['template.html', 'routes.json', 'props.json'].forEach(filename => fs.watch(filename, (event, filename) => {
//     reServe(event, filename)
// }))

// const fs = require('fs-extra')

// try {
//     fs.copy('src/dev', 'src/active')
// } catch (err) { }

// const template = fs.readFileSync('template.html', 'utf-8')

// const template_ = require('./template')
// template_.generate('src', template)

// const liveServer = require('live-server')

// const params = {
//     port: 8080,
//     host: "0.0.0.0",
//     root: "src",
//     open: false,
// }

// liveServer.start(params)
