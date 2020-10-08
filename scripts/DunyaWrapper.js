"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const fs = require('fs-extra');
class DunyaWrapper {
    constructor() {
        //#endregion
        this.mainPath = path.dirname(require.main.filename);
        this.modulePath = path.dirname(__dirname);
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
    //#region Handle arguments
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
    //#endregion
    //#region Types
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
    async pluginLoader(plugins) {
        this.plugins = {};
        for (let plugin of plugins) {
            try {
                const { dunyaPlugin, name, } = this.loadPlugin(plugin);
                this.pluginLoaded(dunyaPlugin, name);
            }
            catch (err) {
                throw new Error(`An error occurred while loading the plugin ${plugin}:\n${err}`);
            }
        }
    }
    resolvePathName(pathName) {
        if (pathName.startsWith('~')) {
            return path.resolve();
        }
        return path.resolve(pathName);
    }
    loadPlugin(pluginName) {
        let plugin = require(this.resolvePathName(pluginName));
        plugin = plugin.default ?? plugin;
        this.validatePlugin(plugin, pluginName);
        return {
            dunyaPlugin: plugin,
            name: plugin.name,
        };
    }
    validatePlugin(plugin, pluginName) {
        if (plugin === undefined)
            throw new Error(`Failed to load the plugin '${pluginName}':
The plugin is undefined.`);
        if (this.typeOf(plugin) !== 'object')
            throw new Error(`Failed to load the plugin '${pluginName}':
The plugin must be a type of 'object'.`);
        if (plugin.name === undefined)
            throw new Error(`Failed to load the plugin '${pluginName}':
The plugin must contain a property 'name'.`);
        if (typeof plugin.name !== 'string')
            throw new Error(`Failed to load the plugin '${pluginName}':
The property 'name' must be of type 'string'`);
        if (plugin.name.trim().length === 0)
            throw new Error(`Failed to load the plugin '${pluginName}':
The property 'name' must not by empty`);
    }
    pluginLoaded(plugin, name) {
        console.log(`Plugin loaded: ${name}`);
        this.plugins[name] = { ...this.plugins[name], ...plugin }; // overwrites old plugin.
    }
    async pluginCaller(cFun, ...args) {
        for (let [index, plugin] of Object.entries(this.plugins)) {
            if (plugin[cFun] === undefined)
                continue;
            await plugin[cFun](this, ...args);
        }
        return;
    }
    async pluginHalter(cFun, ...args) {
        for (let [index, plugin] of Object.entries(this.plugins)) {
            if (plugin[cFun] === undefined)
                continue;
            const res = await plugin[cFun](this, ...args);
            if (res)
                return true;
        }
        return false;
    }
    async pluginPipe(cFun, pipe, ...args) {
        for (let [index, plugin] of Object.entries(this.plugins)) {
            if (plugin[cFun] === undefined)
                continue;
            pipe = (await plugin[cFun](pipe, ...args)) ?? pipe;
        }
        return pipe;
    }
    async getFile(args, currentPath, targetPath) {
        const cFun = 'reversePipeFile';
        for (let [index, plugin] of Object.entries(this.plugins)) {
            if (plugin[cFun] === undefined)
                continue;
            const res = await plugin[cFun](args, currentPath);
            if (res === targetPath)
                return res;
        }
        return undefined;
    }
}
exports.default = DunyaWrapper;
