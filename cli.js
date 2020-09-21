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
        console.log('Usage: iscript <command> <arguments>:')
        console.log('   iscript help            print help message')
        console.log('   iscript dev             ')
        console.log('   iscript generate        ')
        console.log('   iscript build           ')
        console.log('   iscript start           ')
        console.log('')
        console.log('   use iscript <command> ' + helpArgument.join(', ') + ' to get further information.')
    }
})
//#endregion help

//#region dev
validArguments.push({
    name: 'dev',
    call(args) {
        if (helpArgument.includes(args[0])) {
            console.log('Usage iscript dev:')
            console.log('   Will serve the project with hot reload')
            console.log('')
            console.log('   -ip <ipaddress>     sets the ip address of the server.')
            console.log('                       default: \'0.0.0.0\'')
            console.log('   -port <port>        sets the port of the server.')
            console.log('                       default: \'8080\'')
            console.log('   -srcDir <dir>       sets the directory of your code.')
            console.log('                       default: \'src\'')
            console.log('   -srcDev <dir>       sets the dev output directory.')
            console.log('                       default: \'dev\'')
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

//#region *
validArguments.push({
    name: '*',
    call(cname) {
        console.log(`iscript '${cname}' could not be found.`)
        console.log('Use \'iscript help\' for more information.')
    }
})
//#endregion