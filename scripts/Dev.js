"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');
const DunyaWrapper_js_1 = require("./DunyaWrapper.js");
class Dev extends DunyaWrapper_js_1.default {
    //#endregion
    constructor(dirName_, userArgs, autoInit = true) {
        super(dirName_);
        this.userArgs = userArgs;
        this.autoInit = autoInit;
        this.args = {
            config: 'dunya.config.json',
            ip: '0.0.0.0',
            port: 8080,
            in: 'src',
            out: 'string',
            plugins: [],
            watcherConfig: {},
            props: {},
        };
        this.init();
    }
    getConfigPath() {
        return this.userArgs.config ?? this.args.config;
    }
    async configProvider() {
        const configPath = this.getConfigPath();
        this.configArgs = await this.loadAndParseJSONSafe(configPath);
    }
    async argumentProvider() {
        await this.configProvider();
        argumentHandler(this.args, this.configArgs, this.userArgs);
    }
    async pluginLoader() {
        this.plugins = [];
        for (let plugin of this.args.plugins) {
            const dunyaPlugin = require(plugin);
            this.plugins.push(dunyaPlugin);
        }
    }
    async pluginCaller(cFun, ...args) {
        for (let plugin of this.plugins) {
            if (plugin[cFun] === undefined)
                continue;
            await plugin[cFun](...args);
        }
        return;
    }
    //#region Setup
    async preSetup() {
        this.pluginCaller('preSetup');
    }
    async setup() {
        this.pluginCaller('setup');
    }
    async afterSetup() {
        this.pluginCaller('afterSetup');
    }
    //#endregion
    //#region Watcher
    watcher() {
        const watcher = chokidar.watch(this.args.in, {
            ignoreInitial: true,
            ...this.args.watcherConfig,
        });
        watcher.on('all', this.eventHandler);
    }
    //#endregion
    //#region Event Handler
    eventHandler(event, path) {
        this.pluginCaller('watcherEvent', event, path);
    }
    //#endregion
    async init() {
        await this.argumentProvider();
        await this.pluginLoader();
        await this.setup();
        this.watcher();
    }
}
exports.default = Dev;
