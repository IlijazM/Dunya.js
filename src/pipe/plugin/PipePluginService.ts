/**
 * Exports the service that loads and executes plugins.
 *
 * @packageDocumentation
 */

import PluginModel from './PipePluginModel';

import * as Path from 'path';
import PipePluginInterruptException from './exception/PipePluginInterruptException';

/**
 * The service that loads and executes plugins.
 *
 * @author Ilijaz Mehmedovic
 *
 * @version 0.5.0
 */
class PluginService {
  /**
   * A list of all plugins paths of a pipeline.
   *
   * <p>
   * Install a plugin using ``npm i dunya-plugin`` and use the package name as the plugin name
   * to include it.
   * </p>
   *
   * <p>
   * A plugin path starts with a tilde ('~') when its path is relative to the workspace you're
   * currently working with.
   * </p>
   */
  private pluginPaths: Array<string> = [];

  /**
   * A list of all plugins that got loaded.
   */
  private plugins: Array<PluginModel> = [];

  /**
   * A reference to the flags of the PipeService.
   */
  private flags: Record<any, any>;

  /**
   * Default constructor.
   *
   * @param pFlags a reference to the flags of the PipeService.
   */
  constructor(pFlags: Record<any, any>) {
    this.flags = pFlags;
  }

  //#region load plugin

  /**
   * Loads all plugins that got passed as an arguments.
   *
   * @param pPluginPaths a list of all plugin paths.
   */
  public loadPlugins(pPluginPaths: Array<string>) {
    pPluginPaths.forEach(this.loadPlugin);
  }

  /**
   * Loads the plugin that got passed as an arguments.
   *
   * @param pPluginPath a path of a plugin.
   */
  public loadPlugin(pPluginPath: string) {
    // Resolve the plugin path.
    const lfResolvedPluginPath = this.resolvePluginPath(pPluginPath);

    try {
      // Tries to require the plugin.
      let lPlugin: any = require(lfResolvedPluginPath);

      // Typescript automatically exports modules using 'default' as the key.
      // This will support both typescript generated plugins as well as plugins written in
      // javascript.f
      lPlugin = lPlugin.default ?? lPlugin;

      // Validates the plugin.
      this.validatePlugin(lPlugin, lPlugin.name);

      // The plugin got successfully loaded.
      this.loadPluginSuccess(lPlugin, pPluginPath);
    } catch (pErr) {
      // Don't interrupt the application but simply output an error.
      const lfError = new Error(`Invalid plugin path:
      Tried to load the plugin with the path '${pPluginPath}'. Received ${pErr}.`);
      console.error(lfError);
    }
  }

  /**
   * Gets called when the loading of a plugin succeeded.
   *
   * @param pPlugin the plugin object.
   * @param pPluginPath a path of a plugin.
   */
  protected loadPluginSuccess(pPlugin: PluginModel, pPluginPath: string) {
    // Add the plugin to the plugin list.
    this.plugins.push(pPlugin);

    // Add the plugin path to the plugin list.
    this.pluginPaths.push(pPluginPath);

    // Call the 'init' function on the plugin.
    if (pPlugin['init'] !== undefined) {
      pPluginPath['init'].call(this.flags);
    }
  }

  /**
   * Validates a required plugin.
   *
   * <p>
   * Validates a required plugin using the following criteria:
   *
   * <li>It must not be undefined or null</li>
   * <li>It must be an object</li>
   * <li>The plugin must have a name of type string</li>
   * <li>The name of the plugin must not be blank</li>
   * </p>
   *
   * @param plugin the plugin that got loaded.
   * @param pluginName the name of the plugin that got loaded.
   *
   * <p>
   * This parameter gets used for the error messages.
   * </p>
   *
   * @throw when to criteria that got described above got violated.
   */
  protected validatePlugin(plugin: PluginModel, pluginName: string): void {
    if (plugin == null)
      throw new Error(`Failed to load the plugin '${pluginName}':
The plugin is undefined.`);

    if (typeof plugin !== 'object')
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
   * Resolves the path of a plugin path.
   *
   * <p>
   * Resolve means to convert the path in favor of the require function. If the path starts with a
   * tilde (~), then the path should become to an absolute path. If not the path should stay in
   * order of the require function to load the plugin from the node_modules.
   * </p>
   *
   * @param pPath the path of a plugin.
   * @return the resolved path of a plugin.
   */
  protected resolvePluginPath(pPath: string): string {
    if (pPath.startsWith('~')) {
      return Path.resolve(pPath.substr(1).replace(/^\//, ''));
    }

    return pPath;
  }

  //#endregion

  /**
   * Call the functions 'pFunctionName' on every plugin with the arguments 'args' until one plugin
   * returns a truthy value.
   *
   * <p>
   * This method of calling plugins could be used for example for functions that should write the
   * content of a file. You don't want this to happen twice and this method of calling plugins
   * ensures that only one function will get called.
   * </p>
   *
   * <p>
   * When a function got called that doesn't exists, nothing will happen.
   * </p>
   *
   * <p>
   * When an exception gets throws by a function, this function will interrupt the calling of other
   * functions and throws the error.
   * </p>
   *
   * @param pFunctionName the name of function that will get called.
   * @param pArgs additional arguments the function requires.
   */
  pluginCaller(pFunctionName: string, ...pArgs: Array<any>) {
    try {
      for (const lfPlugin of this.plugins) {
        if (lfPlugin[pFunctionName] !== undefined) {
          const lfPluginResult = lfPlugin[pFunctionName](...pArgs);

          if (lfPluginResult) {
            break;
          }
        }
      }
    } catch (pEx) {
      // If the exception is an instance of 'PipePluginInterruptException' nothing should get
      // printed into the console, because this is something that could get used frequently.
      if (!(pEx instanceof PipePluginInterruptException)) {
        console.error(pEx);
      }
    }
  }

  /**
   * Call the functions 'pFunctionName' on every plugin with the arguments 'args' regardless of the
   * return value.
   *
   * <p>
   * This method of calling plugins could be used for example for functions that get triggered on
   * an init event. You don't want any function to interrupt the calling of other functions and
   * this method ensures that every function will get called.
   * </p>
   *
   * <p>
   * When a function got called that doesn't exists, nothing will happen.
   * </p>
   *
   * <p>
   * When an exception gets throws by a function, this function will still execute every plugin and
   * output the error message into the console.
   * </p>
   *
   * @param pFunctionName the name of function that will get called.
   * @param pArgs additional arguments the function requires.
   */
  pluginCallAll(pFunctionName: string, ...pArgs: Array<any>) {
    for (const lfPlugin of this.plugins) {
      if (lfPlugin[pFunctionName] !== undefined) {
        try {
          lfPlugin[pFunctionName](...pArgs);
        } catch (pEx) {
          console.error(pEx);
        }
      }
    }
  }

  /**
   * Call the functions 'pFunctionName' on every plugin until one returns a value that is not
   * ``undefined``. Then it will return the value of the last function,
   *
   * <p>
   * This method of calling plugins could be used for example for functions that reads the content
   * of files.
   * </p>
   *
   * <p>
   * When a function got called that doesn't exists, nothing will happen.
   * </p>
   *
   * <p>
   * When an exception gets throws by a function, this function will interrupt the calling of other
   * functions and throws the error.
   * </p>
   *
   * @param pFunctionName the name of function that will get called.
   * @param pArgs additional arguments the function requires.
   * @return the return value of the last function.
   */
  pluginGetter(pFunctionName: string, ...pArgs: Array<any>): any {
    let lResult: any;

    try {
      for (const lfPlugin of this.plugins) {
        if (lfPlugin[pFunctionName] !== undefined) {
          const lfPluginResult = lfPlugin[pFunctionName](...pArgs);

          if (lfPluginResult) {
            lResult = lfPluginResult;
            break;
          }
        }
      }
    } catch (pEx) {
      // If the exception is an instance of 'PipePluginInterruptException' nothing should get
      // printed into the console, because this is something that could get used frequently.
      if (!(pEx instanceof PipePluginInterruptException)) {
        console.error(pEx);
      }
    }

    return lResult;
  }

  /**
   * Call the functions 'pFunctionName' on every plugin and passes the pipe as a parameter.
   *
   * <p>
   * A pipe means that when there are two different plugins that overwrites the same function, both
   * functions get called with the pipe as the argument. Both functions may manipulate the pipe
   * parameter in the same order as their priorities. At the end, the manipulated pipe value will
   * get returned.
   * </p>
   *
   * <p>
   * This method of calling plugins could be used for example for different functions that perform
   * different actions on a pipe, e.g. a compiler. That means one function compiles the file, the
   * other removes all comments, the other obfuscates the file, etc...
   * </p>
   *
   * <p>
   * When a function got called that doesn't exists, nothing will happen.
   * </p>
   *
   * <p>
   * When an exception gets throws by a function, this function will interrupt the calling of other
   * functions and throws the error.
   * </p>
   *
   * @param pFunctionName the name of function that will get called.
   * @param pPipe the pipe that will get passed and that expected to get returned.
   * @param pArgs additional arguments the function requires.
   * @return the manipulated pipe.
   */
  pluginPipe(pFunctionName: string, pPipe: Record<string, any>, ...pArgs: Array<any>): any {
    let lResultingPipe = pPipe;

    try {
      for (const lfPlugin of this.plugins) {
        if (lfPlugin[pFunctionName] !== undefined) {
          const lfPluginResult = lfPlugin[pFunctionName](lResultingPipe, ...pArgs);

          if (lfPluginResult !== undefined) {
            lResultingPipe = lfPluginResult;
          }
        }
      }
    } catch (pEx) {
      // If the exception is an instance of 'PipePluginInterruptException' nothing should get
      // printed into the console, because this is something that could get used frequently.
      if (!(pEx instanceof PipePluginInterruptException)) {
        console.error(pEx);
      }
    }

    return lResultingPipe;
  }

  //#region calling functions
  /**
   * Should get called when the script gets terminated.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * This function will not get called automatically. However, you could run it manually like
   * following:
   * </p>
   *
   * ```javascript
   * var filePipe = new FilePipeService(arguments);
   * filePipe.terminate();
   * ```
   */
  terminate(): void {
    this.pluginCaller('terminate');
  }

  /**
   * Should get called when the script gets terminated.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * <p>
   * This function will not get called automatically. However, you could run it manually like
   * following:
   * </p>
   *
   * ```javascript
   * var filePipe = new FilePipeService(arguments);
   * filePipe.terminate();
   * ```
   */
  terminateEnsured?(): void {
    this.pluginCallAll('terminate');
  }

  /**
   * Should get called when the script tries to read a file.
   *
   * <p>
   * If a function returns ``undefined``, a function from a plugin with a lower priority will get
   * called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param pPath the path to the file.
   * @return the content of the file as string.
   */
  fsRead?(pPath: string): string {
    return this.pluginGetter('fsRead', pPath);
  }

  /**
   * Should get called when the script tries to write a file.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath the path to the file.
   * @param pFileContent the content of the file as string.
   */
  fsWrite?(pPath: string, pFileContent: string) {
    this.pluginCaller('fsRead', pPath, pFileContent);
  }

  /**
   * Should get called when the script tries to create directories.
   *
   * <p>
   * This function should also handle the case when the path to the directory that gets created
   * isn't provided.
   * </p>
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath the path for the directory.
   */
  fsMkdirs?(pPath: string) {
    this.pluginCaller('fsMkdirs', pPath);
  }

  /**
   * Should get called when the script tires to remove a file or directory.
   *
   * <p>
   * This function should also handle the case when the path to the directory that gets created
   * isn't provided.
   * </p>
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function from
   * a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath the path to the file or directory.
   */
  fsRemove?(pPath: string) {
    this.pluginCaller('fsRemove', pPath);
  }

  /**
   * Should get called when the script tries to check whether a directory is empty or not.
   *
   * <p>
   * If a function returns ``undefined``, a function from a plugin with a lower priority will get
   * called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param pPath the path to a directory.
   * @return true, when the directory is empty.
   */
  fsEmpty?(pPath: string): boolean {
    return this.pluginGetter('fsEmpty', pPath);
  }

  /**
   * Should get called when the script tries to check whether path leads to a directory or not.
   *
   * <p>
   * If a function returns ``undefined``, a function from a plugin with a lower priority will get
   * called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param pPath the path to a file or directory.
   * @return true, when it is a directory.
   */
  fsIsDir?(pPath: string): boolean {
    return this.pluginGetter('fsIsDir', pPath);
  }

  /**
   * Should get called when the script tries to check whether a path exists or not.
   *
   * <p>
   * If a function returns ``undefined``, a function from a plugin with a lower priority will get
   * called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param pPath the path to the file or directory.
   * @return true, when the path exists.
   */
  fsExists?(pPath: string): boolean {
    return this.pluginGetter('fsExists', pPath);
  }

  /**
   * Should get called when the script tries to read a json file.
   *
   * <p>
   * This function must not ensure that the path is a json file.
   * </p>
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath the path to the json file.
   * @return a json object of the content of the file.
   */
  fsReadJSON?(pPath: string): Record<string, any> {
    return this.pluginGetter('fsReadJSON', pPath);
  }

  /**
   * Should get called when the script tries to join together two paths.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function from
   * a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath1 the first path.
   * @param pPath2 the second path.
   * @return the two paths joined.
   */
  pathJoin?(pPath1: string, pPath2: string): string {
    return this.pluginGetter('pathJoin', pPath1, pPath2);
  }

  /**
   * Should get called when the script tries check if two paths are equal.
   *
   * <p>
   * This should especially solves the issue that different paths have different separators.
   * </p>
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath a path.
   * @param pOther another path.
   * @return true, if two paths are equal.
   */
  pathEqual?(pPath: string, pOther: string): boolean {
    return this.pluginGetter('pathEqual', pPath, pOther);
  }

  //#endregion
}

// Export default.
export default PluginService;
