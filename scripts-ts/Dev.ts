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
      path.join(__dirname, 'default-plugins', 'dunya-sass-support'),
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
    this.watcher();
    await this.afterWatcher();
  }
}
