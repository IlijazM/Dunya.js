"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const commandName = `dunya`;
let validArguments = [];
const helpArgument = [`--help`, `-help`, `-h`, `/?`];
/**
 * Will return the value of the argument called `varName` from `args` and automatically parse it.
 *
 * @param args all the arguments of the command
 * @param varName the name of the searched variable
 *
 * @returns the fitting value or a string.
 */
function getArgValue(args, varName) {
    const index = args.indexOf(`-` + varName);
    if (index === -1)
        return null;
    if (args.length <= index + 1)
        return null;
    try {
        return JSON.parse(args[index + 1]);
    }
    catch (err) {
        return args[index + 1];
    }
}
function cli(_args) {
    const arg = _args[2];
    const args = _args.splice(3);
    for (const validArgument of validArguments) {
        if (arg === validArgument.name || arg === undefined || arg.trim() === ``) {
            validArgument.call(args);
            break;
        }
        if (validArgument.name === `*`) {
            validArgument.call(arg);
            break;
        }
    }
}
exports.cli = cli;
//#region help
validArguments.push({
    name: `help`,
    call(args) {
        console.log(`Usage: ${commandName} <command> <arguments>
    ${commandName} help         print help message
    ${commandName} dev          starts the dev script

    use ${commandName} <command> ${helpArgument.join(', ')} to get further information.`);
    },
});
//#endregion help
//#region dev
validArguments.push({
    name: `dev`,
    call(args) {
        if (helpArgument.includes(args[0])) {
            console.log(`Usage: ${commandName} <command> <arguments>
    Will start the pipeline of your project.

    -ip <ip address>                sets the ip address of the server.
                                    default: '127.0.0.1'
    -port <port>                    sets the port of the server. Must be of type 'number'.
                                    default: 8080
    -inputDir <path>                sets the input directory for the watcher.
                                    default: 'input'
    -outputDir <path>               sets the output directory for the watcher and the server.
                                    default: 'output'
    -noWatcher                      starts the dev script without the watcher
    -noServer                       starts the dev script without the server`);
            return;
        }
        console.log(`Executing 'dev'`);
        const Dev = require(`./Dev`).default;
        new Dev({
            ip: getArgValue(args, `ip`),
            port: getArgValue(args, `port`),
            inputDir: getArgValue(args, `inputDir`),
            outputDir: getArgValue(args, `outputDir`),
            noWatcher: args.includes(`-noWatcher`),
            noServer: args.includes(`-noServer`),
        });
    },
});
//#endregion
//#region *
validArguments.push({
    name: `*`,
    call(cname) {
        console.log(`${commandName} ${cname} could not be found.
Use '${commandName} help' for more information.`);
    },
});
//#endregion
