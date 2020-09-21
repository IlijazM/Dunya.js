const fs = require('fs-extra')

try {
    fs.copy('src/building', 'src/active')
} catch (err) { }

const compiler = require('./compiler')
compiler('src', 'docs', () => {
    const fs = require('fs-extra')

    try {
        fs.copy('docs/build', 'docs/active')
    } catch (err) { }

    console.log('compiled successfully')
})