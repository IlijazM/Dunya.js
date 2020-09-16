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
        const content = document.documentElement.innerHTML

        fs.writeFile('docs/output.html', content, (err) => {
            if (err) throw err
        })
    }, 1000)
})
