const ts = require('typescript')
async function compileTypescript(tsCode) {
    return await ts.transpileModule(tsCode, {}).outputText
}

const sass = require('sass')
async function compileSass(sassCode) {
    return sass.renderSync({
        data: sassCode
    }).css.toString()
}

module.exports = async function (args) {
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

    //#region compile
    async function compileTypescriptFile(file) {
        const code = await fs.readFile(file, 'utf-8')
        const compiledCode = await compileTypescript(code)
        await fs.writeFile(file, compiledCode)
        await fs.rename(file, file.substr(0, file.length - 2) + 'js')
    }

    async function compileAllTypescriptFiles() {
        glob(args.devDir + '/**/*.ts', (err, files) => {
            files.forEach(compileTypescriptFile)
        })
    }

    async function compileScssFile(file) {
        const code = await fs.readFile(file, 'utf-8')
        const compiledCode = await compileSass(code)
        await fs.writeFile(file, compiledCode)
        await fs.rename(file, file.substr(0, file.length - 4) + 'css')
    }

    async function compileAllScssFiles() {
        glob(args.devDir + '/**/*.scss', (err, files) => {
            files.forEach(compileTypescriptFile)
        })
    }
    //#endregion

    //#region update
    async function updateAll() {
        try {
            await fs.emptyDir(args.devDir)
            await fs.copy(args.srcDir, args.devDir)

            compileAllTypescriptFiles()
            compileAllScssFiles()
        } catch {

        }
    }

    async function update(event, path) {
        switch (event) {
            case 'add':
                const counterPath = args.devDir + path.substr(args.srcDir.length)
                await fs.copy(path, counterPath)
                break
        }
    }

    await updateAll()
    //#endregion

    //#region watcher
    fs.mkdirSync(args.srcDir, { recursive: true }, (err) => { })

    const chokidar = require('chokidar')

    const watcher = chokidar.watch(args.srcDir, { ignored: /^\./, persistent: true })

    watcher
        .on('add', function (path) {
            update('add', path)
        })
        .on('change', function (path) {
            update('change', path)
        })
        .on('unlink', function (path) {
            update('unlink', path)
        })
        .on('error', function (error) {
            console.error(error)
        })
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
}