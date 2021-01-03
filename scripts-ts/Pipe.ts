//#region imports dependencies
import Args from './Args';
import DunyaPlugin from './DunyaPlugin';
import Plugins from './Plugins';
import { IOPaths } from './Types';

const fs = require('fs-extra');
const Path = require('path-extra');
const glob = require('glob');
//#endregion

export default class Pipe {
  //#region variables
  args: Args = {
    plugins: ['./plugins/default'],

    inputDir: 'input',
    outputDir: 'output',

    ip: '127.0.0.1',
    port: 8080,
  };
  pipeName: string = '';
  plugins: Array<DunyaPlugin> = [];
  exceptions: Array<Function> = [];
  //#endregion

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
  fs = {
    read: (path: string): string => {
      return Plugins.fsRead.call(this, path);
    },
    write: (path: string, fileContent: string) => {
      return Plugins.fsWrite.call(this, path, fileContent);
    },
    mkdirs: (dirs: string) => {
      return Plugins.fsMkdirs.call(this, dirs);
    },
    remove: (path: string) => {
      return Plugins.fsRemove.call(this, path);
    },
    empty: (path: string) => {
      return Plugins.fsEmpty.call(this, path);
    },
    isDir: (path: string): boolean => {
      return Plugins.fsIsDir.call(this, path);
    },
    exists: (path: string): boolean => {
      return Plugins.fsExists.call(this, path);
    },
    readJSON: (path: string): Record<string, any> => {
      return Plugins.fsReadJSON.call(this, path);
    },
  };

  resolvePathName(path: string): string {
    if (path.startsWith('~')) return Path.resolve(path.substr(1).replace(/^\//, ''));
    if (path.startsWith('#')) return './' + Path.join('plugins', path.substr(1).replace(/^\//, ''));
    return path;
  }
  //#endregion

  //#region handle arguments
  handleInputArguments(args: Args) {
    this.overwriteAllArgs(args);
  }

  /**
   * @returns true if the 'pipeName' exists in the 'pipes' object of
   * the dunya.config file.
   */
  isPipeSpecificArgumentValid(pipeName: string): boolean {
    return this.args.pipes[pipeName] !== undefined;
  }

  /**
   * Overwrites the default arguments with 'pipeName'
   */
  handlePipeSpecificArgument() {
    if (!this.pipeName) return;

    if (!this.isPipeSpecificArgumentValid(this.pipeName)) {
      console.warn(`The pipe name '${this.pipeName}' doesn't exist in the dunya.config file.`);
      return;
    }

    this.overwriteAllArgs(this.args.pipes[this.pipeName]);
  }

  loadConfig(args: Args) {
    args.config = args.config ?? 'dunya.config.json';
    let config: any;
    if (fs.existsSync(args.config)) {
      config = fs.readFileSync(args.config, 'utf-8');
      config = JSON.parse(config);
    } else {
      fs.writeFileSync(args.config, '{}');
      config = {};
    }

    this.overwriteAllArgs(config);
  }

  /**
   * Calls the 'overwriteArgs' function on all entires of an object.
   */
  overwriteAllArgs(args: Record<string, any>) {
    Object.entries(args).forEach((v) => this.overwriteArgs(v[0], v[1]));
  }

  /**
   * Will overwrite the property 'key' in 'this.args' with the value
   * 'value'. If they're from different types it throws an error and
   * when they're an object or an array it will merge them together
   * (with 'this.args' having a higher priority).
   */
  overwriteArgs(key: string, value: any) {
    if (value == null) return;
    const argsType = this.typeOf(this.args[key]);
    const overwriteType = this.typeOf(value);

    if (argsType === 'undefined') {
      this.args[key] = value;
      return;
    }

    if (argsType !== overwriteType)
      throw new TypeError(
        `The argument '${key}' in '${this.args.config}' must be of type ${argsType}.`
      );

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

  loadPlugin(pluginName: string) {
    let plugin: any = require(this.resolvePathName(pluginName));
    plugin = plugin.default ?? plugin;
    this.validatePlugin(plugin, plugin.name);

    const index = this.plugins.findIndex((p) => p.name === plugin.name);
    if (index === -1) return this.plugins.push(plugin);
    this.plugins[index] = { ...this.plugins[plugin.name], ...plugin };
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

  /**
   * Sorts 'this.plugin'. Plugins with a higher priority will come first.
   */
  sortPlugins() {
    this.plugins = this.plugins.sort((a: DunyaPlugin, b: DunyaPlugin) =>
      (a.priority || 0) > (b.priority || 0) ? -1 : 1
    );
  }

  /**
   * Will call the function 'cFun' on every plugin with the arguments 'args' until one plugin returns a truthy value
   *
   * @param cFun the name of function that will get called
   * @param args additional arguments the function requires
   */
  pluginCaller(cFun: string, ...args: Array<any>) {
    for (let plugin of this.plugins)
      if (plugin[cFun] !== undefined) if (plugin[cFun].call(this, ...args)) return;
  }

  /**
   * Will call the function 'cFun' on every plugin with the arguments 'args' regardless of the return value
   *
   * @param cFun the name of function that will get called
   * @param args additional arguments the function requires
   */
  pluginCallAll(cFun: string, ...args: Array<any>) {
    for (let plugin of this.plugins)
      if (plugin[cFun] !== undefined) plugin[cFun].call(this, ...args);
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
  pluginGetter(cFun: string, ...args: Array<any>): any {
    for (let plugin of this.plugins)
      if (plugin[cFun] !== undefined) {
        const res = plugin[cFun].call(this, ...args);
        if (res !== undefined) return res;
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
  pluginPipe(cFun: string, pipe: Record<string, any>, ...args: Array<any>): any {
    for (let plugin of this.plugins)
      if (plugin[cFun] !== undefined) pipe = plugin[cFun].call(this, pipe, ...args) ?? pipe;

    return pipe;
  }
  //#endregion

  //#region watcher
  scanAll() {
    glob(Path.join(this.args.inputDir, '**', '*'), (err: any, files: Array<string>) =>
      files.forEach((file: string) =>
        this.eventHandler('add', file.substr(this.args.inputDir.length + 1))
      )
    );
  }

  setupWatcher() {
    if (this.args.noWatcher) return this.scanAll();
    Plugins.setupWatcher.call(this);
  }

  terminateWatcher() {
    if (this.args.noWatcher) return;
    Plugins.terminateWatcher.call(this);
  }
  //#endregion

  //#region eventHandler
  /**
   * Add the prefix 'inputDir' and 'outputDir' to the parameter 'path'.
   *
   * @param path the path that gets converted
   */
  convertPaths(path: string): IOPaths {
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
  eventHandler(event: string, path: string) {
    const iopath = this.convertPaths(path);

    if (event === 'unlink') {
      this.deleteEvent(iopath);
      this.updateDir(Path.dirname(iopath.inputPath));
      return Plugins.updateDir.call(this, Path.dirname(iopath.outputPath));
    }
    if (this.fs.isDir(iopath.inputPath)) {
      this.eventHandlerDir(event, iopath);
      return Plugins.updateDir.call(this, Path.dirname(iopath.outputPath));
    }

    this.eventHandlerFile(event, iopath);

    Plugins.updateDir.call(this, Path.dirname(iopath.outputPath));
  }

  /**
   * Will call a 'change' event on all files in a directory
   *
   * @param path path to the directory that gets updated
   */
  updateDir(path: string) {
    glob(Path.join(path, '*'), (err: any, files: Array<string>) =>
      files.forEach((file: string) => {
        file = file.substr(this.args.inputDir.length + 1);
        this.eventHandler('change', file);
      })
    );
  }

  /**
   * Will handle the 'unlink' event and the unlink file pipeline
   */
  deleteEvent(iopath: IOPaths) {
    iopath = Plugins.deleteEventPipe.call(this, iopath);
    Plugins.deleteEvent.call(this, iopath.outputPath);
  }

  //#region dir events
  /**
   * Will handle all events related to directories
   */
  eventHandlerDir(event: string, iopath: IOPaths) {
    switch (event) {
      case 'add':
        this.addDirEvent(iopath);
        return;
    }
  }

  /**
   * Will handle the add event on a directory
   */
  addDirEvent(iopath: IOPaths) {
    iopath = Plugins.addDirEventPipe.call(this, iopath);
    Plugins.addDirEvent.call(this, iopath.outputPath);
  }
  //#endregion

  //#region file event
  /**
   * Will handle all events related to files
   */
  eventHandlerFile(event: string, iopath: IOPaths) {
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
  addFileEvent(path: string, fileContent: string) {
    let res;

    res = Plugins.filePipe.call(this, { path, fileContent });
    path = res.path;
    fileContent = res.fileContent;

    Plugins.fileEvent.call(this, path, fileContent);

    res = Plugins.addFileEventPipe.call(this, { path, fileContent });
    path = res.path;
    fileContent = res.fileContent;

    if (path == undefined || fileContent == undefined) return;

    Plugins.addFileEvent.call(this, path, fileContent);
  }

  /**
   * Will handle the change event on a file
   */
  changeFileEvent(path: string, fileContent: string) {
    let res;

    res = Plugins.filePipe.call(this, { path, fileContent });
    path = res.path;
    fileContent = res.fileContent;

    Plugins.fileEvent.call(this, path, fileContent);

    res = Plugins.changeFileEventPipe.call(this, { path, fileContent });
    path = res.path;
    fileContent = res.fileContent;

    if (path == undefined || fileContent == undefined) return;

    Plugins.changeFileEvent.call(this, path, fileContent);
  }
  //#endregion

  //#endregion

  //#region server
  startServer() {
    if (this.args.noServer) return;
    Plugins.startServer.call(this);
  }

  stopServer() {
    if (this.args.noServer) return;
    Plugins.stopServer.call(this);
  }
  //#endregion

  //#region init
  constructor(pipeName: string, args: Args) {
    this.pipeName = pipeName;
    this.loadConfig(args);
    this.handlePipeSpecificArgument();
    this.handleInputArguments(args);
    if (!this.args.noAutoInit) this.init();
    if (this.args.autoTerminate) this.terminate();
  }

  init() {
    this.loadPlugins();
    this.setupWatcher();
    this.startServer();
  }

  terminate() {
    Plugins.terminate.call(this);
    this.terminateWatcher();
    this.stopServer.call(this);
  }
  //#endregion
}
