const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');

import IArgs from './IDevArgs';

import DunyaWrapper from './DunyaWrapper.js';

export default class Dev extends DunyaWrapper {
  private args: IArgs = {
    config: 'dunya.config.json',

    ip: '0.0.0.0',
    port: 8080,

    in: 'src',
    out: 'dev',

    plugins: [
      path.join(
        __dirname,
        'default-plugins',
        'default-plugin-validate-in-directory'
      ),
      path.join(
        __dirname,
        'default-plugins',
        'default-plugin-clear-out-directory'
      ),
    ],

    watcherConfig: {},
    props: {},
  };

  //#region Arguments & Config
  private configArgs: Record<string, any>;

  getConfigPath(): string {
    return this.userArgs.config ?? this.args.config;
  }

  async configProvider(): Promise<void> {
    const configPath = this.getConfigPath();
    this.configArgs = await this.loadAndParseJSONSafe(configPath);
  }

  async argumentProvider(): Promise<void> {
    await this.configProvider();
    this.handleArgs(this.args, this.configArgs, this.userArgs);
    this.args.mainPath = this.mainPath;
    this.args.modulePath = this.modulePath;
  }
  //#endregion

  constructor(private userArgs: IArgs = {}, private autoInit = true) {
    super();
    this.init();
  }

  //#region Setup
  async allSetup(): Promise<void> {
    await this.validate();
    await this.preSetup();
    await this.setup();
    await this.afterSetup();
  }

  async validate(): Promise<void> {
    await this.pluginCaller('validate', this.args);
  }

  async preSetup(): Promise<void> {
    await this.pluginCaller('preSetup', this.args);
  }
  async setup(): Promise<void> {
    await this.pluginCaller('setup', this.args);
  }

  async afterSetup(): Promise<void> {
    await this.pluginCaller('afterSetup', this.args);
  }
  //#endregion

  //#region Watcher
  watcher(): void {
    const watcher = chokidar.watch(this.args.in, {
      ignoreInitial: true,
      ...this.args.watcherConfig,
    });
    watcher.on('all', (event: string, path: string): void => {
      this.eventHandler(event, path);
    });
  }
  //#endregion

  //#region Event Handler
  eventHandler(event: string, path: string): void {
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

  eventAdd(path: string): void {
    console.log(path);
  }

  eventUnlink(path: string): void {}
  eventChange(path: string): void {}
  //#endregion

  async init() {
    await this.argumentProvider();
    await this.pluginLoader(this.args.plugins);
    await this.allSetup();
    this.watcher();
  }
}
