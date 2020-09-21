const fs = require('fs-extra')

try {
    fs.copy('src/dev', 'src/active')
} catch (err) { }

const template = fs.readFileSync('template.html', 'utf-8')

const template_ = require('./template')
template_.generate('src', template)