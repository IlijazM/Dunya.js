"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');
const DunyaWrapper_js_1 = require("./DunyaWrapper.js");
class Dev extends DunyaWrapper_js_1.default {
    //#endregion
    constructor(userArgs = {}) {
        super();
        this.userArgs = userArgs;
        this.args = {
            config: 'dunya.config.json',
            ip: '0.0.0.0',
            port: 8080,
            in: 'src',
            out: 'dev',
            noAutoInit: false,
            watcher: true,
            plugins: [
                path.join(__dirname, 'default-plugins', 'default-validate-in-directory'),
                path.join(__dirname, 'default-plugins', 'default-clear-out-directory'),
                path.join(__dirname, 'default-plugins', 'dunya-sass-support'),
                path.join(__dirname, 'default-plugins', 'default-link-template-file'),
                path.join(__dirname, 'default-plugins', 'default-html-compiler'),
                path.join(__dirname, 'default-plugins', 'default-inline-script-compiler'),
            ],
            watcherConfig: {},
            props: {},
        };
        userArgs = userArgs ?? {};
        if (userArgs.noAutoInit !== true)
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
    async watch() {
        this.watcher = chokidar.watch(this.args.in, {
            ...this.args.watcherConfig,
        });
        await this.watcher.on('all', async (event, path) => {
            await this.eventHandler(event, path);
        });
    }
    //#endregion
    //#region Event Handler
    async eventHandlerValidator(event, filePath) {
        const absolutePath = filePath;
        filePath = filePath.substr(this.args.in.length + 1);
        let fileContent;
        if (event !== 'unlink') {
            if ((await fs.lstat(absolutePath)).isDirectory())
                return; // If it is a dir
            fileContent = await fs.readFile(absolutePath);
            fileContent = fileContent.toString();
        }
        // Pipe file
        const res = await this.pluginPipe('pipeFile', { filePath, fileContent }, this.args, event === 'unlink');
        filePath = res.filePath ?? filePath;
        fileContent = res.fileContent ?? fileContent;
        return { filePath, fileContent };
    }
    async eventHandler(event, filePath) {
        const validatorResponse = await this.eventHandlerValidator(event, filePath);
        if (validatorResponse === undefined)
            return;
        filePath = validatorResponse.filePath;
        const fileContent = validatorResponse.fileContent;
        if (await this.pluginHalter('beforeWatchEventHalter', event, filePath))
            return;
        await this.pluginCaller('watcherEvent', event, filePath);
        switch (event) {
            case 'add':
                await this.eventAdd(filePath, fileContent);
                break;
            case 'unlink':
                await this.eventUnlink(filePath);
                break;
            case 'change':
                await this.eventChange(filePath, fileContent);
                break;
        }
        this.pluginHalter('afterWatchEventHalter', event, filePath);
    }
    //#region File events
    async eventAdd(filePath, fileContent) {
        filePath = path.join(this.args.out, filePath);
        console.log(`Adding file '${filePath}'`);
        fs.mkdirsSync(path.dirname(filePath), (err) => { });
        await fs.writeFile(filePath, fileContent);
    }
    async eventUnlink(filePath) {
        filePath = path.join(this.args.out, filePath);
        console.log(`Unlinking file '${filePath}'`);
        await fs.unlink(filePath);
    }
    async eventChange(filePath, fileContent) {
        filePath = path.join(this.args.out, filePath);
        console.log(`Changing file '${filePath}'`);
        fs.mkdirsSync(path.dirname(filePath), (err) => { });
        await fs.writeFile(filePath, fileContent);
    }
    //#endregion
    //#endregion
    //#region After watcher
    async afterWatcher() {
        const pathName = path.join(this.args.in, '**/*');
        glob(pathName, (err, files) => {
            files.forEach((file) => {
                this.eventHandler('add', file);
            });
        });
    }
    //#endregion
    async init() {
        await this.argumentProvider();
        await this.pluginLoader(this.args.plugins);
        await this.allSetup();
        if (this.args.watcher)
            await this.watch();
        await this.afterWatcher();
    }
    async terminate() {
        await this.watcher.stop();
    }
}
exports.default = Dev;
