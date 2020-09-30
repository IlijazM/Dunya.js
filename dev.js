//#region imports
const fs = require('fs-extra')
const glob = require("glob")
//#endregion

module.exports = async function (args) {
    //#region args
    if (args.ip === undefined) args.ip = '0.0.0.0'
    if (args.port === undefined) args.port = 8080
    if (args.srcDir === undefined) args.srcDir = 'src'
    if (args.devDir === undefined) args.devDir = __dirname + '/dev'
    if (args.template === undefined) args.template = 'template.html'
    if (args.props === undefined) args.props = 'props.json'

    if (typeof args.port !== 'number') throw new Error('The argument \'port\' must be a number.')
    if (typeof args.ip !== 'string') throw new Error('The argument \'ip\' must be a string.')
    if (typeof args.srcDir !== 'string') throw new Error('The argument \'srcDir\' must be a string.')
    if (typeof args.devDir !== 'string') throw new Error('The argument \'devDir\' must be a string.')
    if (typeof args.template !== 'string') throw new Error('The argument \'template\' must be a string.')
    if (typeof args.props !== 'string') throw new Error('The argument \'props\' must be a string.')
    //#endregion

    //#region load template
    const template_ = require('./template')
    const template = fs.readFileSync(args.template, 'utf-8')
    //#endregion

    //#region compile
    async function compileFile(file) {
        if (file.endsWith('.ts')) await compileTypescriptFile(file)
        if (file.endsWith('.scss')) await compileScssFile(file)
    }

    async function compilePage(file) {
        if (file.endsWith('.html')) await compileDunyaHTML(file)
    }

    //#region typescript
    const ts = require('typescript')
    async function compileTypescript(tsCode) {
        return await ts.transpileModule(tsCode, {}).outputText
    }

    async function compileTypescriptFile(file) {
        file = appendDev(file)

        const code = await fs.readFile(file, 'utf-8')
        const compiledCode = await compileTypescript(code)
        await fs.writeFile(file, compiledCode)
        await fs.rename(file, file.substr(0, file.length - 2) + 'js')
    }
    //#endregion

    //#region sass
    const sass = require('sass')
    async function compileSass(sassCode) {
        return sass.renderSync({
            data: sassCode
        }).css.toString()
    }

    async function compileScssFile(file) {
        file = appendDev(file)

        const code = await fs.readFile(file, 'utf-8')
        const compiledCode = await compileSass(code)
        await fs.writeFile(file, compiledCode)
        await fs.rename(file, file.substr(0, file.length - 4) + 'css')
    }
    //#endregion

    //#region dunyaHTML
    function compileTemplate(html) {
        html = html.replace(/\"\~\//gm, "\"" + pathName + "/")

        const regex = /\*\{\{(.*?)\}\}/gm

        let m

        while ((m = regex.exec(html)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++
            }

            const match = m[0]
            const index = m.index

            let res = eval(match.substr(1))
            if (res === undefined) res = ''

            html = html.substring(0, index) + res.toString() + html.substr(index + match.length)
            regex.lastIndex += res.toString().length
        }

        return html
    }

    async function compileDunyaHTML(file) {
        const dirs = file.split(/[\\\/]/gm)
        const fileName = dirs[dirs.length - 1]
        const dirName = fileName.substr(0, fileName.length - '.html'.length)
        const pathName = args.devDir

        const props = await fs.readFile(args.props)

        // generate template
        let templateHTML = ''
        try {
            templateHTML = eval(compileTemplate + 'compileTemplate(template)')
        } catch (err) {
            console.error(`There was an error while compiling '${args.template}':`)
            console.error(err)
            return
        }

        await fs.mkdir(appendDev(dirName))
        await fs.move(appendDev(file), appendDev(dirName + '/' + fileName))
        await fs.writeFile(appendDev(dirName + '/index.html'), templateHTML)
    }
    //#endregion
    //#endregion

    //#region functions
    function appendSrc(file) {
        return args.srcDir + '/' + file
    }

    function appendDev(file) {
        return args.devDir + '/' + file
    }
    //#endregion

    //#region events
    async function clearAll() {
        await fs.emptyDir(args.devDir)
    }

    async function update(event, path) {
        path = path.substr(args.srcDir.length + 1)
        switch (event) {
            case 'add':
                await addFile(path)
                break
            case 'unlink':
                await unlinkFile(path)
                break
            case 'change':
                await changeFile(path)
                break
        }
    }

    function getDestinationPath(file) {
        let destination = file

        const dirs = file.split(/[\\\/]/gm)
        if (dirs[0] === 'pages') {
            destination = file.substr(dirs[0].length + 1)
        }

        return destination
    }

    //#region file change handler
    async function addFile(file) {
        const destination = getDestinationPath(file)

        if (destination === '') return

        try {
            const from = appendSrc(file)
            const to = appendDev(destination)

            await fs.copy(from, to)
            await compileFile(destination)

            if (file.startsWith('pages')) await compilePage(destination)
        } catch (err) {
            console.error(err)
        }

    }

    async function unlinkFile(file) {
        const destination = getDestinationPath(file)

        if (destination === '') return

        await fs.remove(destination)
    }

    async function changeFile(file) {
        const destination = getDestinationPath(file)

        if (destination === '') return

        try {
            await fs.copy(file, destination)
            await compileFile(destination)

            if (file.startsWith('pages')) await compilePage(destination)
        } catch (err) {
        }
    }
    //#endregion

    await clearAll()
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