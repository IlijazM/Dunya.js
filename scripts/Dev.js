"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Plugins_1 = require("./Plugins");
const fs = require('fs-extra');
const Path = require('path-extra');
const glob = require('glob');
//#endregion
class Dev {
    //#endregion
    //#region init
    constructor(args) {
        //#region variables
        this.args = {
            plugins: ['./plugins/default'],
            inputDir: 'input',
            outputDir: 'output',
            ip: '127.0.0.1',
            port: 8080,
        };
        this.plugins = [];
        this.exceptions = [];
        //#endregion
        //#region fs
        this.fs = {
            read: (path) => {
                return Plugins_1.default.fsRead.call(this, path);
            },
            write: (path, fileContent) => {
                return Plugins_1.default.fsWrite.call(this, path, fileContent);
            },
            mkdirs: (dirs) => {
                return Plugins_1.default.fsMkdirs.call(this, dirs);
            },
            remove: (path) => {
                return Plugins_1.default.fsRemove.call(this, path);
            },
            empty: (path) => {
                return Plugins_1.default.fsEmpty.call(this, path);
            },
            isDir: (path) => {
                return Plugins_1.default.fsIsDir.call(this, path);
            },
            exists: (path) => {
                return Plugins_1.default.fsExists.call(this, path);
            },
            readJSON: (path) => {
                return Plugins_1.default.fsReadJSON.call(this, path);
            },
        };
        this.loadConfig(args);
        this.handleInputArguments(args);
        if (!this.args.noAutoInit)
            this.init();
    }
    //#endregion
    //#region misc. functions
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
    resolvePathName(path) {
        if (path.startsWith('~'))
            return Path.resolve(path.substr(1));
        if (path.startsWith('#'))
            return './' + Path.join('plugins', path.substr(1));
        return path;
    }
    //#endregion
    //#region handle arguments
    handleInputArguments(args) {
        if (args)
            Object.entries(args).forEach((v) => this.overwriteArgs(v[0], v[1]));
    }
    loadConfig(args) {
        args.config = args.config ?? 'dunya.config.json';
        let config;
        if (fs.existsSync(args.config)) {
            config = fs.readFileSync(args.config, 'utf-8');
            config = JSON.parse(config);
        }
        else {
            config = '{}';
            fs.writeFileSync(args.config, config);
        }
        Object.entries(config).forEach((v) => this.overwriteArgs(v[0], v[1]));
    }
    overwriteArgs(key, value) {
        if (value == null)
            return;
        const argsType = this.typeOf(this.args[key]);
        const overwriteType = this.typeOf(value);
        if (argsType === 'undefined') {
            this.args[key] = value;
            return;
        }
        if (argsType !== overwriteType)
            throw new TypeError(`The argument '${key}' in '${this.args.config}' must be of type ${argsType}.`);
        if (argsType === 'object') {
            this.args[key] = { ...this.args[key], ...value };
            return;
        }
        if (argsType === 'array') {
            this.args[key] = [...this.args[key], ...value];
            return;
        }
        this.args[key] = value;
    }
    //#endregion
    //#region plugins
    loadPlugins() {
        if (this.args.plugins !== undefined)
            this.args.plugins.forEach((plugin) => this.loadPlugin(plugin));
        this.sortPlugins();
        this.pluginCaller('setup');
    }
    loadPlugin(pluginName) {
        let plugin = require(this.resolvePathName(pluginName));
        plugin = plugin.default ?? plugin;
        this.validatePlugin(plugin, plugin.name);
        const index = this.plugins.findIndex((p) => p.name === plugin.name);
        if (index === -1)
            return this.plugins.push(plugin);
        this.plugins[index] = { ...this.plugins[plugin.name], ...plugin };
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
    /**
     * Sorts 'this.plugin'. Plugins with a higher priority will come first.
     */
    sortPlugins() {
        this.plugins = this.plugins.sort((a, b) => (a.priority || 0) > (b.priority || 0) ? -1 : 1);
    }
    /**
     * Will call the function 'cFun' on every plugin with the arguments 'args' until one plugin returns a truthy value
     *
     * @param cFun the name of function that will get called
     * @param args additional arguments the function requires
     */
    pluginCaller(cFun, ...args) {
        for (let plugin of this.plugins)
            if (plugin[cFun] !== undefined)
                if (plugin[cFun].call(this, ...args))
                    return;
    }
    /**
     * Will call the function 'cFun' on every plugin with the arguments 'args' regardless of the return value
     *
     * @param cFun the name of function that will get called
     * @param args additional arguments the function requires
     */
    pluginCallAll(cFun, ...args) {
        for (let plugin of this.plugins)
            if (plugin[cFun] !== undefined)
                plugin[cFun].call(this, ...args);
    }
    /**
     * Will call the function 'cFun' on every plugin with the arguments 'args' until a value that is not undefined got returned.
     * If no value got return the function will return null.
     *
     * @param cFun the name of function that will get called
     * @param args additional arguments the function requires
     *
     * @returns null or the return value of a function of a plugin
     */
    pluginGetter(cFun, ...args) {
        for (let plugin of this.plugins)
            if (plugin[cFun] !== undefined) {
                const res = plugin[cFun].call(this, ...args);
                if (res !== undefined)
                    return res;
            }
        return null;
    }
    /**
     * Will call the function 'cFun' on every plugin with the arguments 'pipe' and 'args'.
     * If the function returns undefined the pipe stays the same, else the function output will overwrite the pipe.
     *
     * @param cFun the name of function that will get called
     * @param pipe an object that will get manipulated and returned again
     * @param args additional arguments the function requires
     *
     * @returns the pipe
     */
    pluginPipe(cFun, pipe, ...args) {
        for (let plugin of this.plugins)
            if (plugin[cFun] !== undefined)
                pipe = plugin[cFun].call(this, pipe, ...args) ?? pipe;
        return pipe;
    }
    //#endregion
    //#region watcher
    setupWatcher() {
        if (this.args.noWatcher)
            return;
        Plugins_1.default.setupWatcher.call(this);
    }
    terminateWatcher() {
        if (this.args.noWatcher)
            return;
        Plugins_1.default.terminateWatcher.call(this);
    }
    //#endregion
    //#region eventHandler
    /**
     * Add the prefix 'inputDir' and 'outputDir' to the parameter 'path'.
     *
     * @param path the path that gets converted
     */
    convertPaths(path) {
        const inputPath = Path.join(this.args.inputDir, path);
        const outputPath = Path.join(this.args.outputDir, path);
        return { path, inputPath, outputPath };
    }
    /**
     * Will get called whenever a file got added, changed or removed from the input directory.
     * This function will take care of the file pipeline.
     *
     * @param event the watcher event. Possible events: 'add', 'change', 'unlink'.
     * @param path the path to the file without the 'inputDir' as prefix.
     */
    eventHandler(event, path) {
        const iopath = this.convertPaths(path);
        Plugins_1.default.updateDir.call(this, Path.dirname(iopath.outputPath));
        if (event === 'unlink') {
            this.deleteEvent(iopath);
            return this.updateDir(Path.dirname(iopath.inputPath));
        }
        if (this.fs.isDir(iopath.inputPath))
            return this.eventHandlerDir(event, iopath);
        return this.eventHandlerFile(event, iopath);
    }
    /**
     * Will call a 'change' event on all files in a directory
     *
     * @param path path to the directory that gets updated
     */
    updateDir(path) {
        glob(Path.join(path, '*'), (err, files) => files.forEach((file) => {
            file = file.substr(this.args.inputDir.length + 1);
            this.eventHandler('change', file);
        }));
    }
    /**
     * Will handle the 'unlink' event and the unlink file pipeline
     */
    deleteEvent(iopath) {
        iopath = Plugins_1.default.deleteEventPipe.call(this, iopath);
        Plugins_1.default.deleteEvent.call(this, iopath.outputPath);
    }
    //#region dir events
    /**
     * Will handle all events related to directories
     */
    eventHandlerDir(event, iopath) {
        switch (event) {
            case 'add':
                this.addDirEvent(iopath);
                return;
        }
    }
    /**
     * Will handle the add event on a directory
     */
    addDirEvent(iopath) {
        iopath = Plugins_1.default.addDirEventPipe.call(this, iopath);
        Plugins_1.default.addDirEvent.call(this, iopath.outputPath);
    }
    //#endregion
    //#region file event
    /**
     * Will handle all events related to files
     */
    eventHandlerFile(event, iopath) {
        let fileContent = this.fs.read(iopath.inputPath);
        switch (event) {
            case 'add':
                return this.addFileEvent(iopath.outputPath, fileContent);
            case 'change':
                return this.changeFileEvent(iopath.outputPath, fileContent);
        }
    }
    /**
     * Will handle the add event on a file
     */
    addFileEvent(path, fileContent) {
        let res;
        res = Plugins_1.default.filePipe.call(this, { path, fileContent });
        path = res.path;
        fileContent = res.fileContent;
        Plugins_1.default.fileEvent.call(this, path, fileContent);
        res = Plugins_1.default.addFileEventPipe.call(this, { path, fileContent });
        path = res.path;
        fileContent = res.fileContent;
        if (path == undefined || fileContent == undefined)
            return;
        Plugins_1.default.addFileEvent.call(this, path, fileContent);
    }
    /**
     * Will handle the change event on a file
     */
    changeFileEvent(path, fileContent) {
        let res;
        res = Plugins_1.default.filePipe.call(this, { path, fileContent });
        path = res.path;
        fileContent = res.fileContent;
        Plugins_1.default.fileEvent.call(this, path, fileContent);
        res = Plugins_1.default.changeFileEventPipe.call(this, { path, fileContent });
        path = res.path;
        fileContent = res.fileContent;
        if (path == undefined || fileContent == undefined)
            return;
        Plugins_1.default.changeFileEvent.call(this, path, fileContent);
    }
    //#endregion
    //#endregion
    //#region server
    startServer() {
        if (this.args.noServer)
            return;
        Plugins_1.default.startServer.call(this);
    }
    stopServer() {
        if (this.args.noServer)
            return;
        Plugins_1.default.stopServer.call(this);
    }
    init() {
        this.loadPlugins();
        this.setupWatcher();
        this.startServer();
    }
    terminate() {
        Plugins_1.default.terminate();
        this.terminateWatcher();
        this.stopServer.call(this);
    }
}
exports.default = Dev;
