const commandName = 'dunya'

let validArguments = []
const helpArgument = [
    '--help',
    '-help',
    '-h',
    '/?',
]

function getArgValue(args, varName) {
    const index = args.indexOf('-' + varName)
    if (index === -1) return undefined
    if (args.length <= index + 1) return undefined

    try {
        return JSON.parse(args[index + 1])
    } catch (err) {
        return args[index + 1]
    }
}

export function cli(_args) {
    const arg = _args[2]
    const args = _args.splice(3)

    for (let i = 0; i < validArguments.length; i++) {
        const validArgument = validArguments[i];

        if (arg === validArgument.name || arg === undefined || arg.trim() === '') {
            validArgument.call(args)
            break
        }

        if (validArgument.name === '*') {
            validArgument.call(arg)
            break
        }
    }
}

//#region help
validArguments.push({
    name: 'help',
    call(args) {
        console.log('Usage: ' + commandName + ' <command> <arguments>:')
        console.log('   ' + commandName + ' help            print help message')
        console.log('   ' + commandName + ' dev             ')
        console.log('   ' + commandName + ' generate        ')
        console.log('   ' + commandName + ' build           ')
        console.log('   ' + commandName + ' start           ')
        console.log('')
        console.log('   use ' + commandName + ' <command> ' + helpArgument.join(', ') + ' to get further information.')
    }
})
//#endregion help

//#region dev
validArguments.push({
    name: 'dev',
    call(args) {
        if (helpArgument.includes(args[0])) {
            console.log('Usage ' + commandName + ' dev:')
            console.log('   Will serve the project with hot reload')
            console.log('')
            console.log('   -ip <ipaddress>     sets the ip address of the server.')
            console.log('                       default: \'0.0.0.0\'')
            console.log('   -port <port>        sets the port of the server.')
            console.log('                       default: \'8080\'')
            console.log('   -srcDir <dir>       sets the directory of your code.')
            console.log('                       default: \'src\'')
            console.log('   -srcDev <dir>       sets the dev output directory.')
            console.log('                       default: \'__dirname/dev\'')
            console.log('                       default: \'src\'')
            console.log('   -template <file>    sets the file for the template html.')
            console.log('                       default: \'template.html\'')
            return
        }

        console.log('Executing \'dev\'')
        require('./dev')({
            ip: getArgValue(args, 'ip'),
            port: getArgValue(args, 'port'),
            srcDir: getArgValue(args, 'srcDir'),
            devDir: getArgValue(args, 'devDir'),
            template: getArgValue(args, 'template'),
        })
    }
})
//#endregion

//#region generate
validArguments.push({
    name: 'generate',
    call(args) {
        if (helpArgument.includes(args[0])) {
            console.log('Usage ' + commandName + ' generate:')
            console.log('   Will generate files in the \'src\' directory')
            console.log('')
            console.log('   -srcDir <dir>       sets the directory of your code.')
            console.log('                       default: \'src\'')
            console.log('   -template <file>    sets the file for the template html.')
            console.log('                       default: \'template.html\'')
            console.log('   -routesPath <file>  set the path to the routes.json.')
            console.log('                       default: \'routes.html\'')
            return
        }

        require('./generate')({
            srcDir: getArgValue(args, 'srcDir'),
            template: getArgValue(args, 'template'),
            routesPath: getArgValue(args, 'routesPath'),
        })
    }
})
//#endregion

//#region *
validArguments.push({
    name: '*',
    call(cname) {
        console.log(`${commandName} '${cname}' could not be found.`)
        console.log('Use \'${commandName} help\' for more information.')
    }
})
//#endregion