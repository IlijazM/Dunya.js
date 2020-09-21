const sass = require('sass')

const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
// async function compileSass(sassCode) {
//     return sass.render({
//         data: sassCode
//     })
// }

// !async function $() {
//     const res = await compileSass(`
//         body {
//             display: flex;
//         }
//     `)

//     console.log(res)
// }()
var css;

css = sass.renderSync({
    data: `
    $primary-color: #333;
    
    body {
      color: $primary-color;
      box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
    }`,
})
css = css.css.toString()

autoprefixer({ boxShadow: true })
postcss([autoprefixer]).process(css, { from: undefined }).then(result => {
    result.warnings().forEach(warn => {
        console.warn(warn.toString())
    })
    console.log(result.css)
})