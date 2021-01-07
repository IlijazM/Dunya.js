/**
 * Exports the dunya plugin interface that is used to write new plugins for dunya.js.
 */

/**
 * Contains important functions that are necessary for various plugins for dunya.js.
 */
interface DunyaPlugin {
  name: string;

  /**
   * The priority of the plugin.
   *
   * <p>
   * Plugins with a higher priority will get executed earlier.
   * The default priority is 0 but the priority of the default plugin is 100.
   * </p>
   *
   * <ul>
   * Norms:
   *
   * <li>
   * > 400: Only events that does not influence anything and does not stop any function
   * </li>
   *
   * <li>
   * > 300: When a file format gets converted e.g. scss -> css</li>
   * <li>
   *
   * <li>
   * > 200: When a file gets moved or edited but not the file format it self e.g. a minimizer
   * </li>
   *
   * <li>
   * < 100: When another event gets appended that does not influence the content or path of the
   * file
   * </li>
   *
   * </ul>
   */
  priority?: number;

  //#endregion setup and terminate
  /**
   * Gets called after all plugins loaded.
   */
  setup?(): void;

  /**
   * Gets called when the script gets terminated.
   *
   * <p>
   * This function will not get called automatically. However, you could run it manually like
   * following:
   * </p>
   *
   * ```javascript
   * var pipe = new Pipe(pipeName, config);
   * pipe.terminate();
   * ```
   *
   * <p>
   * Or using a chain:
   * </p>
   *
   * ```javascript
   * var chain = new Chain(pipes, config);
   * chain.terminateAll();
   * ```
   *
   * <p>
   * This will be the first function that will get called when trying
   * to terminate the script.
   * </p>
   *
   * <p>
   * After this function the <var>terminateWatcher</var> function will get called first, then the
   * <var>stopServer</var> function.
   * </p>
   */
  terminate?(): void;
  //#endregion

  //#region fs
  /**
   * Gets called when the script tries to read a file.
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param path the path to the file.
   * @return the content of the file as string.
   */
  fsRead?(path: string): string;

  /**
   * Gets called when the script tries to write a file.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param path the path to the file.
   * @param fileContent the content of the file as string.
   * @return return a value other than ``undefined`` if the function overwrites any other
   *         function.
   */
  fsWrite?(path: string, fileContent: string): boolean;

  /**
   * Gets called when the script tries to create directories.
   *
   * <p>
   * This function should also handle the case when the path to the directory that gets created
   * isn't provided.
   * </p>
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param path the path for the directory.
   * @return return a truthy value if the function overwrites any other function.
   */
  fsMkdirs?(path: string): boolean;

  /**
   * Gets called when the script tires to remove a file or directory.
   *
   * <p>
   * This function should also handle the case when the path to the directory that gets created
   * isn't provided.
   * </p>
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param path the path to the file or directory.
   * @return return a truthy value if the function overwrites any other function.
   */
  fsRemove?(path: string): boolean;

  /**
   * Gets called when the script tries to check whether a directory is empty or not.
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param path the path to a directory.
   * @return true, when the directory is empty.
   */
  fsEmpty?(path: string): boolean;

  /**
   * Gets called when the script tries to check whether path leads to a directory or not.
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param path the path to a file or directory.
   * @return true, when it is a directory.
   */
  fsIsDir?(path: string): boolean;

  /**
   * Gets called when the script tries to check whether a path exists or not.
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param path the path to the file or directory.
   * @return true, when the path exists.
   */
  fsExists?(path: string): boolean;

  /**
   * Gets called when the script tries to read a json file.
   *
   * <p>
   * This function must not ensure that the path is a json file.
   * </p>
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param path the path to the json file.
   * @return a json object of the content of the file.
   */
  fsReadJSON?(path: string): Record<string, any>;
  //#endregion

  //#region watcher
  /**
   * Sets up the watcher
   *
   * method to call: pluginCaller
   *
   * @return return a truthy value if the function ends
   */
  setupWatcher?(): boolean;

  /**
   * Terminates the watcher when the terminate function gets called.
   *
   * Node: the terminate function will not get called by default.
   *
   * method to call: pluginCaller
   *
   * @return return a truthy value if the function ends
   */
  terminateWatcher?(): boolean;
  //#endregion

  //#region event handlers
  /**
   * Gets called when a file or a directory gets unlinked (deleted).
   *
   * <p>
   * Use this function to manipulate the path of the file that got deleted. The file content can't
   * get manipulated since this value doesn't matter when the script tries to delete a file.
   * </p>
   *
   * <p>
   * This function is a pipe which means that when there are two different plugins that overwrites
   * the same function, both functions get called with the pipe as the argument. Both functions may
   * manipulate the pipe in the same order as their priorities.
   * </p>
   *
   * <p>
   * If this function returns ``undefined`` the value of the pipe arguments stays the same.
   * </p>
   *
   * @param pipe an object with the path as an argument.
   * @param pipe.path the path to the file or directory that got unlinked.
   * @return the manipulated pipe or ``undefined``.
   */
  deleteEventPipe?(pipe: { path: string }): { path: string };

  /**
   * Will get called when a file or a directory gets unlinked.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param path the output directory
   */
  deleteEvent?(path: string): boolean;

  /**
   * Gets called when a file or a directory gets added.
   *
   * <p>
   * Use this function to manipulate the path of the file that got deleted. The file content can't
   * get manipulated since this value doesn't matter when the script tries to delete a file.
   * </p>
   *
   * <p>
   * This function is a pipe which means that when there are two different plugins that overwrites
   * the same function, both functions get called with the pipe as the argument. Both functions may
   * manipulate the pipe in the same order as their priorities.
   * </p>
   *
   * <p>
   * If this function returns ``undefined`` the value of the pipe arguments stays the same.
   * </p>
   *
   * @param pipe an object with the path as an argument.
   * @return the manipulated pipe or ``undefined``.
   */
  addDirEventPipe?(pipe: { path: string }): { path: string };

  /**
   * Will get called when a directory gets added
   *
   * method to call: pluginCaller
   *
   * @param path the output directory
   * @return a truthy value if the function ends
   */
  addDirEvent?(path: string): boolean;

  /**
   * Will get called on the 'add' event as well as on the 'change' event before 'addFileEventPipe' or 'changeFileEventPipe'
   *
   * method to call: pluginPipe
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @return 'pipe'
   */
  filePipe?(pipe: { path: string; fileContent: string }): { path: string; fileContent: string };

  /**
   * Will get called on the 'add' event as well as on the 'change' event before 'addFileEvent' or 'changeFileEvent'
   *
   * method to call: pluginCaller
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @return a truthy value if the function ends
   */
  fileEvent?(path: string, fileContent: string): boolean;

  /**
   * Will get called on the 'add' event
   *
   * method to call: pluginPipe
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @return 'pipe'
   */
  addFileEventPipe?(pipe: {
    path: string;
    fileContent: string;
  }): { path: string; fileContent: string };

  /**
   * Will get called on the 'add' event
   *
   * method to call: pluginCaller
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @return a truthy value if the function ends
   */
  addFileEvent?(path: string, fileContent: string): boolean;

  /**
   * Will get called on the 'change' event
   *
   * method to call: pluginPipe
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @return 'pipe'
   */
  changeFileEventPipe?(pipe: {
    path: string;
    fileContent: string;
  }): { path: string; fileContent: string };

  /**
   * Will get called on the 'change' event
   *
   * method to call: pluginCaller
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @return a truthy value if the function ends
   */
  changeFileEvent?(path: string, fileContent: string): boolean;

  /**
   * Will get called when a event gets called on a file inside a directory
   *
   * method to call: pluginCaller
   *
   * @param path the output path to the directory of the file
   * @return a truthy value if the function ends
   */
  updateDir?(path: string): boolean;

  //#endregion

  //#region server
  /**
   * Will get called when the server gets setup
   *
   * method to call: pluginCaller
   *
   * @return a truthy value if the function ends
   */
  startServer?(): boolean;

  /**
   * Will get called when the server gets terminated.
   *
   * Node: the terminate function will not get called by default.
   *
   * method to call: pluginCaller
   *
   * @return a truthy value if the function ends
   */
  stopServer?(): boolean;
  //#endregion
}

export default DunyaPlugin;
