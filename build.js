const compiler = require('./compiler')

compiler('src', 'docs', () => {
    console.log('compiled successfully')
})