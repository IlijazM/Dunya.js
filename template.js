const fs = require('fs')

async function generate(root, pathName, template) {
    const routes = JSON.parse(fs.readFileSync('routes.json', 'utf-8'))

    fs.mkdir(root, { recursive: true }, (err) => {
        if (err) throw err
    })

    routes.forEach(route => generateFiles(root, route, template, pathName))
}

function generateFiles(root, route, template, pathName) {
    let html = template
        .replace(/\$globalPath/gm, pathName)
        .replace(/\$localPath/gm, pathName + route.url)
        .replace(/\$body/gm, pathName + '/' + route.name + '.html')
        .replace(/\$compile/gm, '"$compiler$"')

    fs.mkdirSync(root + route.url, { recursive: true }, (err) => {
        if (err) throw err
    })

    fs.writeFile(root + route.url + '/index.html', html, (err) => { })
    fs.writeFile(root + route.url + '/' + route.name + '.html', '<div>\n    <title>Inline Script - ' + route.name + '</title>\n</div>', { flag: 'wx' }, (err) => { })

    if (route.subPaths !== undefined) {
        route.subPaths.forEach(route => generateFiles(root, route, template, pathName))
    }
}

module.exports = {
    generate: generate
}