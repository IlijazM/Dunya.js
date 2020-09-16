const productName = 'Inline-Script-Custom-Boilerplate'

const navigation = [
    { url: globalPath + '/', name: 'Home' },
]

let headerHeight = 100

setTimeout(() => {
    document.body.style.display = 'initial'
    fadeIn()
}, 1000)


inlineScript()

document.body.style.display = 'initial'
fadeIn()