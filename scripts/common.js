"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAndParseJSONSafe = exports.parseJSONSafe = exports.loadFileSafe = void 0;
const path = require('path');
const fs = require('fs-extra');
async function loadFileSafe(pathName) {
    if (!fs.existsSync(pathName))
        throw new Error(`Missing '${pathName}'.`);
    return (await fs.readFile(pathName)).toString();
}
exports.loadFileSafe = loadFileSafe;
function parseJSONSafe(content, name) {
    try {
        return JSON.parse(content);
    }
    catch (err) {
        throw new SyntaxError(`An error occurred while parsing '${name}':\n${err}`);
    }
}
exports.parseJSONSafe = parseJSONSafe;
async function loadAndParseJSONSafe(pathName) {
    const name = path.basename(pathName);
    const content = await loadFileSafe(pathName);
    return parseJSONSafe(content, name);
}
exports.loadAndParseJSONSafe = loadAndParseJSONSafe;
