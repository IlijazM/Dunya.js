module.exports = function (args) {
    if (args.srcDir === undefined) args.srcDir = 'src'
    if (args.template === undefined) args.template = 'template.html'
    if (args.routesPath === undefined) args.routesPath = 'routes.json'

    if (typeof args.srcDir !== 'string') throw new Error('The argument \'srcDir\' must be a string.')
    if (typeof args.template !== 'string') throw new Error('The argument \'template\' must be a string.')
    if (typeof args.routesPath !== 'string') throw new Error('The argument \'routesPath\' must be a string.')

    const fs = require('fs-extra');

    ['', '/dev', '/building', '/build', '/components', '/scripts', '/styles'].forEach(item => {
        fs.mkdirSync(args.srcDir + item, { recursive: true }, (err) => { })
    });

    ['/styles/main.scss', '/dev/app.js', '/building/app.js', '/build/app.js', '/components/app.html', '/scripts/app.ts'].forEach(item => {
        fs.open(args.srcDir + item, 'wx', (err) => { })
    });

    const template = fs.readFileSync(args.template, 'utf-8')

    const template_ = require('./template')(args.srcDir, template, args.routesPath)
}