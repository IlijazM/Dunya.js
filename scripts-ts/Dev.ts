const fs = require('fs-extra');
const Path = require('path-extra');
const sane = require('sane');
const liveServer = require('live-server');

import { fileURLToPath } from 'url';
import Args from './Args';
import DunyaPlugin from './DunyaPlugin';
import DunyaServer from './DunyaServer';
import DunyaServerArgs from './DunyaServerArgs';

export default class Dev {
  args: Args = {
    inputDir: 'input',
    outputDir: 'output',

    ip: '127.0.0.1',
    port: 8080,
  };
  plugins: Array<DunyaPlugin> = [];

  //#region misc. functions
  typeOf(object: any): string {
    if (object === null) return 'null';
    if (typeof object === 'object') {
      if (object instanceof Array) return 'array';
      if (object instanceof RegExp) return 'regex';
    }
    return typeof object;
  }
  //#endregion

  //#region fs
  readFile(path: string): string {
    return fs.readFileSync(path, 'utf-8');
  }

  writeFile(path: string, fileContent: string) {
    this.mkdirs(Path.dirname(path));
    fs.writeFile(path, fileContent, 'utf-8');
  }

  mkdirs(dirs: string) {
    fs.mkdirsSync(dirs, () => {});
  }

  removeDir(dir: string) {
    fs.remove(dir);
  }

  unlinkFile(path: string) {
    fs.unlinkSync(path);
  }

  isDir(path: string): boolean {
    return fs.lstatSync(path).isDirectory();
  }

  getFile(path: string): string {
    try {
      return this.readFile(path);
    } catch {
      return null;
    }
  }

  loadFileSave(path: string): string {
    return this.readFile(path);
  }

  loadFileJSON(path: string): Record<string, any> {
    try {
      return JSON.parse(this.readFile(path));
    } catch (err) {
      throw new Error(`An error occurred while parsing '${path}':\n${err}`);
    }
  }

  resolvePluginPathName(pathName: string): string {
    return Path.resolve(pathName);
  }
  //#endregion

  //#region handle arguments
  handleInputArguments(args: Args) {
    if (args) Object.entries(args).forEach((v) => this.overwriteArgs(v[0], v[1]));
    if (!this.args.noAutoInit) this.init();
  }

  loadConfig() {
    if (!this.args.config) return;
    const config = this.loadFileJSON(this.args.config);
    Object.entries(config).forEach((v) => this.overwriteArgs(v[0], v[1]));
  }

  overwriteArgs(key: string, value: any) {
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
    if (this.args.plugins !== undefined) this.args.plugins.forEach(this.loadPlugin);
    this.pluginCaller('setup');
  }

  loadPlugin(pluginName: string) {
    let plugin: any = require(this.resolvePluginPathName(pluginName));
    plugin = plugin.default ?? plugin;
    this.validatePlugin(plugin, pluginName);
    this.plugins[pluginName] = { ...this.plugins[pluginName], ...plugin };
  }

  validatePlugin(plugin: DunyaPlugin, pluginName: string): void {
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

  pluginCaller(cFun: string, ...args: Array<any>) {
    for (let [index, plugin] of Object.entries(this.plugins))
      if (plugin[cFun] !== undefined) plugin[cFun](this, ...args);
  }
  //#endregion

  //#region watcher
  watcher: any;

  setupWatcher() {
    if (this.args.noWatcher) return;
    this.mkdirs(this.args.inputDir);
    fs.emptyDirSync(this.args.outputDir);
    const watcher = sane(this.args.inputDir);
    watcher.on('all', (event, path) => this.eventHandler(event, path));
  }
  //#endregion

  //#region eventHandler
  eventHandler(event: string, path: string) {
    const inputPath = Path.join(this.args.inputDir, path);
    const outputPath = Path.join(this.args.outputDir, path);

    if (event === 'delete') return this.deleteEvent(outputPath);
    if (this.isDir(inputPath)) return this.eventHandlerDir(event, inputPath, outputPath);
    return this.eventHandlerFile(event, inputPath, outputPath);
  }

  deleteEvent(path: string) {
    fs.remove(path);
  }

  //#region dir events
  eventHandlerDir(event: string, inputPath: string, outputPath: string) {
    switch (event) {
      case 'add':
        this.dirAddEvent(outputPath);
        return;
    }
  }

  dirAddEvent(path: string) {
    this.mkdirs(path);
  }
  //#endregion

  //#region file event
  eventHandlerFile(event: string, inputPath: string, outputPath: string) {
    const fileContent = this.readFile(inputPath);

    switch (event) {
      case 'add':
        return this.fileAddEvent(outputPath, fileContent);

      case 'change':
        return this.fileChangeEvent(outputPath, fileContent);
    }
  }

  fileAddEvent(path: string, fileContent: string) {
    this.fileChangeEvent(path, fileContent);
  }

  fileChangeEvent(path: string, fileContent: string) {
    this.writeFile(path, fileContent);
  }
  //#endregion

  //#endregion

  //#region server
  server: DunyaServer = {
    onStart: function (args: DunyaServerArgs) {
      const params = {
        port: args.port,
        host: args.ip,
        root: args.dir,
        open: false,
        ...args,
      };
      liveServer.start(params);
    },
    onStop: function () {},
  };

  startServer() {
    if (this.args.noServer) return;
    this.server.onStart({
      ip: this.args.ip,
      port: this.args.port,
      root: this.args.outputDir,
    });
  }

  stopServer() {
    if (this.args.noServer) return;
    this.server.onStop();
  }
  //#endregion

  constructor(args: Args) {
    this.handleInputArguments(args);
  }

  init() {
    this.loadConfig();
    this.loadPlugins();
    this.setupWatcher();
    this.startServer();
  }
}
