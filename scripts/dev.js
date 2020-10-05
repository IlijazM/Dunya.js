"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');
const argumentHandler_js_1 = require("./argumentHandler.js");
//#region arguments
function getDefaultArgs(dirname) {
    return {
        ip: '0.0.0.0',
        port: 8080,
        in: 'src',
        out: dirname + '/dev',
        props: {},
    };
}
async function loadArgs(dirname, userArgs) {
    let args = getDefaultArgs(dirname);
    const config = await loadConfig(userArgs.config);
    argumentHandler_js_1.default(args, config, userArgs);
    return args;
}
async function loadConfig(path) {
    path = path ?? 'dunya.config.json';
    if (!fs.existsSync(path))
        throw new Error(`Missing '${path}'.`);
    const config = await fs.readFile(path);
    try {
        return JSON.parse(config.toString());
    }
    catch (err) {
        throw new SyntaxError(`An error occurred while parsing '${path}':\n${err}`);
    }
}
//#endregion
function validateFiles(args) {
    [args.in, args.out].forEach((file) => {
        if (!fs.existsSync(file))
            throw new Error(`Missing '${file}'.`);
    });
}
async function setup(args) {
    await fs.emptyDir(args.out); // this will also automatically create a directory.
}
function watcher(args) {
    const watcher = chokidar.watch(args.in, {
        ignoreInitial: true,
    });
    watcher.on('all', eventHander);
}
function eventHander(event, path) {
    switch (event) {
        case 'add':
            break;
        case 'unlink':
            break;
        case 'change':
            break;
    }
}
function server(args) { }
async function dev(dirname, userArgs) {
    const args = await loadArgs(dirname, userArgs);
    validateFiles(args);
    await setup(args);
    watcher(args);
}
exports.default = dev;
