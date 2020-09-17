module.exports = function compile(callback) {
    const port = 8080

    //#region Server
    const express = require('express')
    const app = express()

    app.use(express.static('docs'))

    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
    //#endregion

    const jsdom = require("jsdom")
    const { JSDOM } = jsdom

    const fs = require('fs')

    JSDOM.fromURL('http://localhost:8080/', {
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
    }).then((dom) => {
        setTimeout(() => {
            const document = dom.window.document
            let content = document.documentElement.innerHTML

            content = content
                .replace(/inlineScriptCompile\s*=\s*true/gm, 'inlineScriptCompile=undefined')
                .replace(/compilerscript/gm, 'script')

            fs.writeFile('docs/output.html', content, (err) => {
                if (err) throw err

                console.log('compiled!')

                callback()
            })
        }, 1000)
    })
}