"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const Path = require('path-extra');
const sane = require('sane');
const liveServer = require('live-server');
class Dev {
    //#endregion
    constructor(args) {
        this.args = {
            inputDir: 'input',
            outputDir: 'output',
            ip: '127.0.0.1',
            port: 8080,
        };
        this.plugins = [];
        //#endregion
        //#endregion
        //#region server
        this.server = {
            onStart: function (args) {
                const params = {
                    port: args.port,
                    host: args.ip,
                    root: args.dir,
                    open: false,
                    ...args,
                };
                liveServer.start(params);
            },
            onStop: function () { },
        };
        this.handleInputArguments(args);
    }
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
    //#endregion
    //#region fs
    readFile(path) {
        return fs.readFileSync(path, 'utf-8');
    }
    writeFile(path, fileContent) {
        this.mkdirs(Path.dirname(path));
        fs.writeFile(path, fileContent, 'utf-8');
    }
    mkdirs(dirs) {
        fs.mkdirsSync(dirs, () => { });
    }
    removeDir(dir) {
        fs.remove(dir);
    }
    unlinkFile(path) {
        fs.unlinkSync(path);
    }
    isDir(path) {
        return fs.lstatSync(path).isDirectory();
    }
    getFile(path) {
        try {
            return this.readFile(path);
        }
        catch {
            return null;
        }
    }
    loadFileSave(path) {
        return this.readFile(path);
    }
    loadFileJSON(path) {
        try {
            return JSON.parse(this.readFile(path));
        }
        catch (err) {
            throw new Error(`An error occurred while parsing '${path}':\n${err}`);
        }
    }
    resolvePluginPathName(pathName) {
        return Path.resolve(pathName);
    }
    //#endregion
    //#region handle arguments
    handleInputArguments(args) {
        if (args)
            Object.entries(args).forEach((v) => this.overwriteArgs(v[0], v[1]));
        if (!this.args.noAutoInit)
            this.init();
    }
    loadConfig() {
        if (!this.args.config)
            return;
        const config = this.loadFileJSON(this.args.config);
        Object.entries(config).forEach((v) => this.overwriteArgs(v[0], v[1]));
    }
    overwriteArgs(key, value) {
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
    }
    //#endregion
    //#region load plugins
    loadPlugins() {
        if (this.args.plugins !== undefined)
            this.args.plugins.forEach(this.loadPlugin);
        this.pluginCaller('setup');
    }
    loadPlugin(pluginName) {
        let plugin = require(this.resolvePluginPathName(pluginName));
        plugin = plugin.default ?? plugin;
        this.validatePlugin(plugin, pluginName);
        this.plugins[pluginName] = { ...this.plugins[pluginName], ...plugin };
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
    pluginCaller(cFun, ...args) {
        for (let [index, plugin] of Object.entries(this.plugins))
            if (plugin[cFun] !== undefined)
                plugin[cFun](this, ...args);
    }
    setupWatcher() {
        if (this.args.noWatcher)
            return;
        this.mkdirs(this.args.inputDir);
        fs.emptyDirSync(this.args.outputDir);
        const watcher = sane(this.args.inputDir);
        watcher.on('all', (event, path) => this.eventHandler(event, path));
    }
    //#endregion
    //#region eventHandler
    eventHandler(event, path) {
        const inputPath = Path.join(this.args.inputDir, path);
        const outputPath = Path.join(this.args.outputDir, path);
        if (event === 'delete')
            return this.deleteEvent(outputPath);
        if (this.isDir(inputPath))
            return this.eventHandlerDir(event, inputPath, outputPath);
        return this.eventHandlerFile(event, inputPath, outputPath);
    }
    deleteEvent(path) {
        fs.remove(path);
    }
    //#region dir events
    eventHandlerDir(event, inputPath, outputPath) {
        switch (event) {
            case 'add':
                this.dirAddEvent(outputPath);
                return;
        }
    }
    dirAddEvent(path) {
        this.mkdirs(path);
    }
    //#endregion
    //#region file event
    eventHandlerFile(event, inputPath, outputPath) {
        const fileContent = this.readFile(inputPath);
        switch (event) {
            case 'add':
                return this.fileAddEvent(outputPath, fileContent);
            case 'change':
                return this.fileChangeEvent(outputPath, fileContent);
        }
    }
    fileAddEvent(path, fileContent) {
        this.fileChangeEvent(path, fileContent);
    }
    fileChangeEvent(path, fileContent) {
        this.writeFile(path, fileContent);
    }
    startServer() {
        if (this.args.noServer)
            return;
        this.server.onStart({
            ip: this.args.ip,
            port: this.args.port,
            root: this.args.outputDir,
        });
    }
    stopServer() {
        if (this.args.noServer)
            return;
        this.server.onStop();
    }
    init() {
        this.loadConfig();
        this.loadPlugins();
        this.setupWatcher();
        this.startServer();
    }
}
exports.default = Dev;
