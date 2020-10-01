const fs = require('fs-extra')
const glob = require('glob')

const jsdom = require("jsdom")
const { JSDOM } = jsdom

const template_ = require('./template')

module.exports = async function compile(root, target, callback) {
    const port = 8080

    await fs.copy(root, target)

    //#region Server
    const express = require('express')
    const app = express()

    app.use(express.static(root))

    const server = app.listen(port, () => console.log('Started server'))
    //#endregion

    // const template = fs.readFileSync('template.html', 'utf-8')
    // template_.generate(root, template)

    // const routes = JSON.parse(fs.readFileSync('routes.json', 'utf-8'))

    const routes = []

    await (new Promise((resolve, reject) => {
        glob('build/**/index.html', (err, files) => {
            if (err) return console.error(err)
            files.forEach(file => routes.push(file))
            resolve()
        })
    }))

    for (let route of routes) {
        const splitted = route.split(/[\\\/]/gm)
        let url
        let name

        if (splitted.length === 2) {
            url = ''
            name = 'Home'
        } else {
            url = splitted
                .filter((v, i) => i !== splitted.length - 1)
                .join('/')
                .substr(target.length)

            name = splitted[splitted.length - 2]
        }

        route = {
            name: name,
            url: url
        }

        await compileRoute(target, route)
        console.log("finished " + route.name)
    }

    setTimeout(() => {
        callback()
    }, 1000)
}

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time);
    })
}

async function compileRoute(target, route) {
    return new Promise(async (resolve, reject) => {
        const dom = await JSDOM.fromURL('http://localhost:8080' + route.url, {
            virtualConsole: new jsdom.VirtualConsole(),
            resources: 'usable',
            runScripts: 'dangerously',
            pretendToBeVisual: true,
        })

        const document = dom.window.document

        let i
        for (i = 0; i < 200; i++) {
            await sleep(10)

            if (document.body.getAttribute('finished-compiling') === null) continue

            const content = document.documentElement.outerHTML

            fs.writeFile(target + '/' + route.url + '/index.html', content, (err) => {
                if (err) throw err
            })

            if (route.subPaths !== undefined) {
                for (subPath of route.subPaths) {
                    await compileRoute(target, subPath)
                    console.log("finished " + subPath.name)
                }
            }


            resolve()
            break
        }

        if (i === 200) reject()
    })
}