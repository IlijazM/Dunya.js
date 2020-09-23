const fs = require('fs')

module.exports = async function (root, template, routesPath) {
    const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'))

    fs.mkdir(root, { recursive: true }, (err) => {
        if (err) throw err
    })

    routes.forEach(route => generateFiles(root, route, template, '..'))
}

function generateFiles(root, route, template, globalPath) {
    const pathName = route.url === '' ? '.' : globalPath

    // let html = template.replace(/\"\~\//gm, "\"" + pathName + "/")
    // const props = fs.readFileSync(propsPath, 'utf-8')
    // html = eval(compileTemplate + 'compileTemplate(html)')

    fs.mkdirSync(root + route.url, { recursive: true }, (err) => {
        if (err) throw err
    })

    // fs.writeFile(root + route.url + '/index.html', html, (err) => { })
    fs.writeFile(root + route.url + '/' + route.name + '.html', '', { flag: 'wx' }, (err) => { })
    fs.writeFile(root + route.url + '/' + route.name + 'head.html', '<title>' + route.name + '</title>', { flag: 'wx' }, (err) => { })
    fs.writeFile(root + route.url + '/' + route.name + '.scss', '', { flag: 'wx' }, (err) => { })

    if (route.subPaths !== undefined) {
        route.subPaths.forEach(route => generateFiles(root, route, template, '../' + globalPath))
    }
}