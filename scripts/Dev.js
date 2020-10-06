"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');
const DunyaWrapper_js_1 = require("./DunyaWrapper.js");
class Dev extends DunyaWrapper_js_1.default {
    //#endregion
    constructor(dirName_, userArgs = {}, autoInit = true) {
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
        this.handleArgs(this.args, this.configArgs, this.userArgs);
    }
    //#region Setup
    async allSetup() {
        await this.validate();
        await this.preSetup();
        await this.setup();
        await this.afterSetup();
    }
    async validate() {
        await this.pluginCaller('validate');
    }
    async preSetup() {
        await this.pluginCaller('preSetup');
    }
    async setup() {
        await this.pluginCaller('setup');
    }
    async afterSetup() {
        await this.pluginCaller('afterSetup');
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
        await this.pluginLoader(this.args.plugins);
        await this.allSetup();
        this.watcher();
    }
}
exports.default = Dev;
