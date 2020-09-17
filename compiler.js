const fs = require('fs-extra')

const jsdom = require("jsdom")
const { JSDOM } = jsdom

const template_ = require('./template')

module.exports = function compile(root, target, callback) {
    const port = 8080

    //#region Server
    const express = require('express')
    const app = express()

    app.use(express.static(root))

    const server = app.listen(port, () => console.log('Started server'))
    //#endregion

    fs.copySync(root, target, (err) => { })

    const template = fs.readFileSync('compiletemplate.html', 'utf-8')
    template_.generate(root, '', template)

    const routes = JSON.parse(fs.readFileSync('routes.json', 'utf-8'))

    routes.forEach(route => compileRoute(target, route))

    setTimeout(() => {
        server.close()
        console.log('Stopped server')

        console.log('compiled!')
        callback()
    }, 1000)
}

function compileRoute(target, route) {
    JSDOM.fromURL('http://localhost:8080' + route.url, {
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
    }).then((dom) => {
        setTimeout(() => {
            const document = dom.window.document
            let content = document.documentElement.innerHTML

            content = content.split('"$compiler$"').join(false)

            fs.writeFile(target + '/' + route.url + '/index.html', content, (err) => {
                if (err) throw err
            })
        }, 1000)
    })

    if (route.subPaths !== undefined) route.subPaths.forEach(route => compileRoute(target, route))
}