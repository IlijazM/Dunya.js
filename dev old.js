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
    if (args.props === undefined) args.props = 'props.json'
    if (args.liveServer === undefined) args.liveServer = true

    if (typeof args.port !== 'number') throw new Error('The argument \'port\' must be a number.')
    if (typeof args.ip !== 'string') throw new Error('The argument \'ip\' must be a string.')
    if (typeof args.srcDir !== 'string') throw new Error('The argument \'srcDir\' must be a string.')
    if (typeof args.devDir !== 'string') throw new Error('The argument \'devDir\' must be a string.')
    if (typeof args.props !== 'string') throw new Error('The argument \'props\' must be a string.')
    //#endregion

    //#region load template
    if (!fs.pathExistsSync(args.srcDir)) {
        console.error(`ERROR: Missing '${args.srcDir}'.`)
        return
    }

    try {
        const template_ = require('./template')
        let template = fs.readFileSync(args.srcDir + '/template.html', 'utf-8')
    } catch (err) {
        console.error(`ERROR: Missing '${args.srcDir + '/template.html'}'.`)
        return
    }
    //#endregion

    //#region compile
    async function updateInlineScriptFile(file) {
        const dirs = file
            .split(/[\\\/]/gm)
            .filter((v, i) => i !== file.split(/[\\\/]/gm).length - 1)
            .join('/')

        await new Promise((resolve, reject) => {
            glob(appendDev(dirs) + '/*.inline-script', (err, files) => {
                files.forEach(async file => {
                    const splitted = file.split(/[\\\/]/gm)
                    const fileName = splitted[splitted.length - 1]
                    file = dirs + '/' + fileName
                    await compileInlineScriptFile(file)
                })

                resolve()
            })
        })
    }

    async function compileFile(file) {
        if (file.endsWith('.inline-script')) return await compileInlineScriptFile(file)
        if (file.endsWith('.ts')) await compileTypescriptFile(file)
        if (file.endsWith('.scss')) await compileScssFile(file)

        await updateInlineScriptFile(file)
    }

    async function compilePage(file) {
        if (file.endsWith('.html')) await compileHTMLFile(file)
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

    //#region html
    function compileHTML(html) {
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

    async function compileHTMLFile(file) {
        const dirs = file.split(/[\\\/]/gm)
        const fileName = dirs[dirs.length - 1]
        let dirName = file.substr(0, file.length - '.html'.length)
        let pathName = '.' + new Array(dirs.length).fill('/..').join('')

        if (dirName === 'Home') {
            pathName = '.'
            dirName = ''
        }

        const props = await fs.readFile(args.props)

        // generate template
        let templateHTML = ''
        try {
            templateHTML = eval(compileHTML + 'compileHTML(template)')
        } catch (err) {
            console.error(`There was an error while compiling 'template.html':`)
            console.error(err)
            return
        }

        try {
            // mkdir could already exist
            await fs.mkdir(appendDev(dirName))
        } catch (err) { }

        try {
            // src and destination could be the same
            await fs.move(appendDev(file), appendDev(dirName + '/' + fileName), { overwrite: true })
        } catch (err) { }

        await fs.writeFile(appendDev(dirName + '/index.html'), templateHTML)
    }
    //#endregion

    //#region inline script
    async function compileInlineScriptFile(file) {
        const dirs = file.split(/[\\\/]/gm)
        const fileNameInlineScript = dirs[dirs.length - 1]
        const dirName = fileNameInlineScript.substr(0, fileNameInlineScript.length - '.inline-script'.length)
        const fileName = dirName + '.html'
        const path = dirs.filter((v, i) => i !== dirs.length - 1)
        let pathName = '.' + new Array(dirs.length).fill('/..').join('')

        if (dirName === 'Home') {
            pathName = '.'
            dirName = ''
        }

        let css = ''
        try {
            css = (await fs.readFile(appendDev(path) + '/' + dirName + '.css')).toString()
        } catch (err) { }

        let js = ''
        try {
            js = (await fs.readFile(appendDev(path) + '/' + dirName + '.js')).toString()
        } catch (err) { }

        let inlineScriptHTML = (await fs.readFile(appendDev(file))).toString()
        if (css !== '') inlineScriptHTML += '<style scoped>' + css + '</style>'
        if (js !== '') inlineScriptHTML += '<script>' + js + '</script>'

        const props = await fs.readFile(args.props)

        // generate template
        let templateHTML = ''
        try {
            templateHTML = eval(compileHTML + 'compileHTML(template)')
        } catch (err) {
            console.error(`There was an error while compiling 'template.html':`)
            console.error(err)
            return
        }

        await fs.writeFile(appendDev(dirName + '/' + fileName), inlineScriptHTML)
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

        if (path === 'template.html') {
            await new Promise((resolve, reject) => {
                glob(args.srcDir + '/pages/*', async (err, files) => {
                    for (let file of files) {
                        template = fs.readFileSync(args.srcDir + '/template.html', 'utf-8')
                        await update('change', file)
                    }

                    resolve()
                })
            })
        }

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
        let destination = getDestinationPath(file)

        if (destination === '') return

        if (destination.endsWith('.ts')) destination = destination.substr(0, destination.length - 'ts'.length) + 'js'
        if (destination.endsWith('.scss')) destination = destination.substr(0, destination.length - 'scss'.length) + 'css'

        const dir = appendDev(destination)

        await fs.remove(dir)
    }

    async function changeFile(file) {
        const destination = getDestinationPath(file)

        if (destination === '') return

        try {
            const from = appendSrc(file)
            const to = appendDev(destination)

            await fs.copy(from, to)

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

    let finished = false
    glob(args.srcDir + '/**', async (err, files) => {
        files = files.sort((a, b) => {
            if (a.endsWith('.inline-script')) return 1
            return -1
        })

        for (let file of files) {
            await update('change', file)
        }

        if (args.liveServer !== true) {
            setTimeout(() => {
                finished = true
            }, 100)
        }
    })

    //#endregion

    if (args.liveServer === true) {
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

    while (!finished && !args.liveServer) {
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 10)
        })
    }
}