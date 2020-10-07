const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');

import IArgs from './IDevArgs';

import DunyaWrapper from './DunyaWrapper.js';

export default class Dev extends DunyaWrapper {
  args: IArgs = {
    config: 'dunya.config.json',

    ip: '0.0.0.0',
    port: 8080,

    in: 'src',
    out: 'dev',

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
    await this.pluginCaller('validate');
  }

  async preSetup(): Promise<void> {
    await this.pluginCaller('preSetup');
  }
  async setup(): Promise<void> {
    await this.pluginCaller('setup');
  }

  async afterSetup(): Promise<void> {
    await this.pluginCaller('afterSetup');
  }
  //#endregion

  //#region Watcher
  async watcher(): Promise<void> {
    const watcher = chokidar.watch(this.args.in, {
      ignoreInitial: true,
      ...this.args.watcherConfig,
    });
    await watcher.on(
      'all',
      async (event: string, path: string): Promise<void> => {
        await this.eventHandler(event, path);
      }
    );
  }
  //#endregion

  //#region Event Handler
  async eventHandler(event: string, filePath: string): Promise<void> {
    if (await (await fs.lstat(filePath)).isDirectory()) return; // If it is a dir
    filePath = filePath.substr(this.args.in.length + 1);
    if (await this.pluginHalter('beforeWatchEventHalter', event, filePath))
      return;
    await this.pluginCaller('watcherEvent', event, filePath);

    switch (event) {
      case 'add':
        await this.eventAdd(filePath);
        break;
      case 'unlink':
        await this.eventUnlink(filePath);
        break;
      case 'change':
        await this.eventChange(filePath);
        break;
    }

    this.pluginHalter('afterWatchEventHalter', event, filePath);
  }

  //#region Raw events
  async eventAdd(filePath: string): Promise<void> {
    let fileContent = await fs.readFile(path.join(this.args.in, filePath));
    fileContent = fileContent.toString();

    const res = await this.pluginPipe(
      'pipeFile',
      { filePath, fileContent },
      this.args,
      false
    );

    filePath = res.filePath ?? filePath;
    fileContent = res.fileContent ?? fileContent;

    await this.eventAddFile(filePath, fileContent);
  }

  async eventUnlink(filePath: string): Promise<void> {
    const fileContent = '';

    const res = await this.pluginPipe(
      'pipeFile',
      { filePath, fileContent },
      this.args,
      true
    );

    filePath = res.filePath ?? filePath;

    await this.eventUnlinkFile(filePath);
  }

  async eventChange(filePath: string): Promise<void> {
    let fileContent = await fs.readFile(path.join(this.args.in, filePath));
    fileContent = fileContent.toString();

    const res = await this.pluginPipe(
      'pipeFile',
      { filePath, fileContent },
      this.args,
      false
    );

    filePath = res.filePath ?? filePath;
    fileContent = res.fileContent ?? fileContent;

    await this.eventChangeFile(filePath, fileContent);
  }
  //#endregion

  //#region File events
  async eventAddFile(filePath: string, fileContent: string): Promise<void> {
    filePath = path.join(this.args.out, filePath);
    console.log(`Adding file '${filePath}'`);
    await fs.mkdir(path.dirname(filePath), (err) => {});
    await fs.writeFile(filePath, fileContent);
  }

  async eventUnlinkFile(filePath: string): Promise<void> {
    filePath = path.join(this.args.out, filePath);
    console.log(`Unlinking file '${filePath}'`);
    await fs.unlink(filePath);
  }

  async eventChangeFile(filePath: string, fileContent: string): Promise<void> {
    filePath = path.join(this.args.out, filePath);
    console.log(`Changing file '${filePath}'`);
    await fs.mkdir(path.dirname(filePath), (err) => {});
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
    await this.watcher();
    await this.afterWatcher();
  }
}
