"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');
const DunyaWrapper_js_1 = require("./DunyaWrapper.js");
class Dev extends DunyaWrapper_js_1.default {
    //#endregion
    constructor(userArgs = {}, autoInit = true) {
        super();
        this.userArgs = userArgs;
        this.autoInit = autoInit;
        this.args = {
            config: 'dunya.config.json',
            ip: '0.0.0.0',
            port: 8080,
            in: 'src',
            out: 'dev',
            plugins: [
                path.join(__dirname, 'default-plugins', 'default-plugin-validate-in-directory'),
                path.join(__dirname, 'default-plugins', 'default-plugin-clear-out-directory'),
            ],
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
        this.args.mainPath = this.mainPath;
        this.args.modulePath = this.modulePath;
    }
    //#region Setup
    async allSetup() {
        await this.validate();
        await this.preSetup();
        await this.setup();
        await this.afterSetup();
    }
    async validate() {
        await this.pluginCaller('validate', this.args);
    }
    async preSetup() {
        await this.pluginCaller('preSetup', this.args);
    }
    async setup() {
        await this.pluginCaller('setup', this.args);
    }
    async afterSetup() {
        await this.pluginCaller('afterSetup', this.args);
    }
    //#endregion
    //#region Watcher
    watcher() {
        const watcher = chokidar.watch(this.args.in, {
            ignoreInitial: true,
            ...this.args.watcherConfig,
        });
        watcher.on('all', (event, path) => {
            this.eventHandler(event, path);
        });
    }
    //#endregion
    //#region Event Handler
    eventHandler(event, path) {
        path = path.substr(this.args.in.length + 1);
        this.pluginCaller('watcherEvent', this.args, event, path);
        switch (event) {
            case 'add':
                this.eventAdd(path);
                break;
            case 'unlink':
                this.eventUnlink(path);
                break;
            case 'change':
                this.eventChange(path);
                break;
        }
    }
    eventAdd(path) {
        console.log(path);
    }
    eventUnlink(path) { }
    eventChange(path) { }
    //#endregion
    async init() {
        await this.argumentProvider();
        await this.pluginLoader(this.args.plugins);
        await this.allSetup();
        this.watcher();
    }
}
exports.default = Dev;