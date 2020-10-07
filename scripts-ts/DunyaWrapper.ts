import { dirname } from 'path';
import DunyaPlugin from './DunyaPlugin';

const path = require('path');
const fs = require('fs-extra');

export default class DunyaWrapper {
  //#region Loading & Parsing
  async loadFileSafe(pathName: string): Promise<string> {
    if (!fs.existsSync(pathName)) throw new Error(`Missing '${pathName}'.`);
    return (await fs.readFile(pathName)).toString();
  }

  parseJSONSafe(content: string, name: string): Record<string, any> {
    try {
      return JSON.parse(content);
    } catch (err) {
      throw new SyntaxError(
        `An error occurred while parsing '${name}':\n${err}`
      );
    }
  }

  async loadAndParseJSONSafe(pathName: string): Promise<Record<string, any>> {
    const name = path.basename(pathName);

    const content = await this.loadFileSafe(pathName);

    return this.parseJSONSafe(content, name);
  }
  //#endregion

  //#region Handle arguments
  handleArgs(
    args: Record<string, any>,
    ...overwriteArguments: Array<Record<string, any>>
  ): void {
    overwriteArguments.forEach((other) => {
      this.overwriteArgs(args, other);
    });
  }

  overwriteArgs(args: Record<string, any>, other: Record<string, any>): void {
    for (let [index, value] of Object.entries(args)) {
      if (other[index] === undefined) continue;

      const type = this.validateTypes(args[index], other[index], index);

      if (type === 'object') {
        args[index] = { ...args[index], ...other[index] };
        continue;
      }

      if (type === 'array') {
        args[index] = [...args[index], ...other[index]];
        continue;
      }

      args[index] = other[index];
    }
  }
  //#endregion

  //#region Types
  validateTypes(main: any, other: any, name: string = ''): string {
    const mainType = this.typeOf(main);
    const otherType = this.typeOf(other);

    if (mainType !== otherType)
      throw new TypeError(
        `The argument '${name}' must be of type '${mainType}'.`
      );

    return mainType;
  }

  typeOf(object: any): string {
    if (object === null) return 'null';
    if (typeof object === 'object') {
      if (object instanceof Array) return 'array';
      if (object instanceof RegExp) return 'regex';
    }
    return typeof object;
  }
  //#endregion

  //#region Plugins
  private plugins: Record<string, DunyaPlugin>;

  async pluginLoader(plugins: Array<string>): Promise<void> {
    this.plugins = {};

    for (let plugin of plugins) {
      try {
        const {
          dunyaPlugin,
          name,
        }: { dunyaPlugin: DunyaPlugin; name: string } = this.loadPlugin(plugin);
        this.pluginLoaded(dunyaPlugin, name);
      } catch (err) {
        throw new Error(
          `An error occurred while loading the plugin ${plugin}:\n${err}`
        );
      }
    }
  }

  resolvePathName(pathName: string): string {
    if (pathName.startsWith('~')) {
      return path.resolve();
    }

    return path.resolve(pathName);
  }

  loadPlugin(pluginName: string): { dunyaPlugin: DunyaPlugin; name: string } {
    let plugin: any = require(this.resolvePathName(pluginName));
    plugin = plugin.default ?? plugin;
    this.validatePlugin(plugin, pluginName);
    return {
      dunyaPlugin: plugin,
      name: plugin.name,
    };
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

  pluginLoaded(plugin: DunyaPlugin, name: string): void {
    console.log(`Plugin loaded: ${name}`);
    this.plugins[name] = { ...this.plugins[name], ...plugin }; // overwrites old plugin.
  }

  async pluginCaller(cFun: string, ...args: Array<any>): Promise<unknown> {
    for (let [index, plugin] of Object.entries(this.plugins)) {
      if (plugin[cFun] === undefined) continue;
      await plugin[cFun](...args);
    }

    return;
  }
  //#endregion

  mainPath = path.dirname(require.main.filename);
  modulePath = path.dirname(__dirname);
  constructor() {}
}
