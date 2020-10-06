"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const fs = require('fs-extra');
class DunyaWrapper {
    constructor(dirName) {
        this.dirName = dirName;
    }
    //#region Loading & Parsing
    async loadFileSafe(pathName) {
        if (!fs.existsSync(pathName))
            throw new Error(`Missing '${pathName}'.`);
        return (await fs.readFile(pathName)).toString();
    }
    parseJSONSafe(content, name) {
        try {
            return JSON.parse(content);
        }
        catch (err) {
            throw new SyntaxError(`An error occurred while parsing '${name}':\n${err}`);
        }
    }
    async loadAndParseJSONSafe(pathName) {
        const name = path.basename(pathName);
        const content = await this.loadFileSafe(pathName);
        return this.parseJSONSafe(content, name);
    }
    //#endregion
    handleArgs(args, ...overwriteArguments) {
        overwriteArguments.forEach((other) => {
            this.overwriteArgs(args, other);
        });
    }
    overwriteArgs(args, other) {
        for (let [index, value] of Object.entries(args)) {
            if (other[index] === undefined)
                continue;
            const type = this.validateTypes(args[index], other[index], index);
            if (type === 'object') {
                args[index] = { ...args[index], ...other[index] };
                continue;
            }
            if (type === 'array') {
                args[index] = [...args[index], ...other[index]];
                continue;
            }
            args[index] = other[index];
        }
    }
    validateTypes(main, other, name = '') {
        const mainType = this.typeOf(main);
        const otherType = this.typeOf(other);
        if (mainType !== otherType)
            throw new TypeError(`The argument '${name}' must be of type '${mainType}'.`);
        return mainType;
    }
    typeOf(object) {
        if (object === null)
            return 'null';
        if (typeof object === 'object') {
            if (object instanceof Array)
                return 'array';
            if (object instanceof RegExp)
                return 'regex';
        }
        return typeof object;
    }
}
exports.default = DunyaWrapper;
