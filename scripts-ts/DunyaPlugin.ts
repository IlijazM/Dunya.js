export default interface DunyaPlugin {
  name: string;
  /**
   * The priority of the plugin.
   * Plugins with a greater priority will get executed earlier.
   * The default priority is 0 but the priority of the default plugin is 100.
   *
   * Norms:
   * > 400: Only events that does not influence anything and does not stop any function
   * > 300: When a file format gets converted e.g. scss -> css
   * > 200: When a file gets moved or edited but not the file format it self e.g. a minimizer
   * < 100: When another event gets appended that does not influence the content or path of the file
   */
  priority?: number;

  //#endregion setup and terminate
  /**
   * Will get called after all plugins loaded.
   *
   * method to call: pluginCallAll
   */
  setup?(): void;

  /**
   * Terminates the script.
   *
   * Will not get called by default but you could run it manually.
   *
   * This will be the first function that will get called when trying
   * to terminate the script.
   *
   * After this function the terminateWatcher function will get called first,
   * then the stopServer function.
   *
   * method to call: pluginCallAll
   */
  terminate?(): void;
  //#endregion

  //#region fs
  /**
   * method to call: pluginGetter
   *
   * @param path the path to the file
   * @returns the content of the file as string
   */
  fsRead?(path: string): string;

  /**
   * method to call: pluginCaller
   *
   * @param path the path to the file
   * @param fileContent the content of the file as string
   * @returns return a truthy value if the function ends
   */
  fsWrite?(path: string, fileContent: string): boolean;

  /**
   * method to call: pluginCaller
   *
   * @param path the path for the directory
   * @returns return a truthy value if the function ends
   */
  fsMkdirs?(dirs: string): boolean;

  /**
   * method to call: pluginCaller
   *
   * @param path the path to the file or directory
   * @returns return a truthy value if the function ends
   */
  fsRemove?(path: string): boolean;

  /**
   * method to call: pluginCaller
   *
   * @param path the path to the directory
   * @returns return a truthy value if the function ends
   */
  fsEmpty?(path: string): boolean;

  /**
   * method to call: pluginGetter
   *
   * @param path the path to the file or directory
   * @returns true when it is a directory
   */
  fsIsDir?(path: string): boolean;

  /**
   * method to call: pluginGetter
   *
   * @param path the path to the file or directory
   * @returns true when the file or directory exists
   */
  fsExists?(path: string): boolean;

  /**
   * method to call: pluginGetter
   *
   * @param path the path to the file
   * @returns an object of the content of the file
   */
  fsReadJSON?(path: string): Record<string, any>;
  //#endregion

  //#region watcher
  /**
   * Sets up the watcher
   *
   * method to call: pluginCaller
   *
   * @returns return a truthy value if the function ends
   */
  setupWatcher?(): boolean;

  /**
   * Terminates the watcher when the terminate function gets called.
   *
   * Node: the terminate function will not get called by default.
   *
   * method to call: pluginCaller
   *
   * @returns return a truthy value if the function ends
   */
  terminateWatcher?(): boolean;
  //#endregion

  //#region event handlers
  /**
   * Will get called when a file or a directory gets unlinked
   *
   * method to call: pluginPipe
   *
   * @param pipe iopath
   * @returns iopath
   */
  deleteEventPipe?(pipe: { path: string }): { path: string };

  /**
   * Will get called when a file or a directory gets unlinked
   *
   * method to call: pluginPipe
   *
   * @param path the output directory
   */
  deleteEvent?(path: string): boolean;

  /**
   * Will get called when a directory gets added
   *
   * method to call: pluginPipe
   *
   * @param pipe.path the output path
   * @returns 'pipe'
   */
  addDirEventPipe?(pipe: { path: string }): { path: string };

  /**
   * Will get called when a directory gets added
   *
   * method to call: pluginCaller
   *
   * @param path the output directory
   * @returns a truthy value if the function ends
   */
  addDirEvent?(path: string): boolean;

  /**
   * Will get called on the 'add' event as well as on the 'change' event before 'addFileEventPipe' or 'changeFileEventPipe'
   *
   * method to call: pluginPipe
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @returns 'pipe'
   */
  filePipe?(pipe: { path: string; fileContent: string }): { path: string; fileContent: string };

  /**
   * Will get called on the 'add' event as well as on the 'change' event before 'addFileEvent' or 'changeFileEvent'
   *
   * method to call: pluginCaller
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @returns a truthy value if the function ends
   */
  fileEvent?(path: string, fileContent: string): boolean;

  /**
   * Will get called on the 'add' event
   *
   * method to call: pluginPipe
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @returns 'pipe'
   */
  addFileEventPipe?(pipe: { path: string; fileContent: string }): { path: string; fileContent: string };

  /**
   * Will get called on the 'add' event
   *
   * method to call: pluginCaller
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @returns a truthy value if the function ends
   */
  addFileEvent?(path: string, fileContent: string): boolean;

  /**
   * Will get called on the 'change' event
   *
   * method to call: pluginPipe
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @returns 'pipe'
   */
  changeFileEventPipe?(pipe: { path: string; fileContent: string }): { path: string; fileContent: string };

  /**
   * Will get called on the 'change' event
   *
   * method to call: pluginCaller
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   * @returns a truthy value if the function ends
   */
  changeFileEvent?(path: string, fileContent: string): boolean;

  /**
   * Will get called when a event gets called on a file inside a directory
   *
   * method to call: pluginCaller
   *
   * @param path the output path to the directory of the file
   * @returns a truthy value if the function ends
   */
  updateDir?(path: string): boolean;

  //#endregion

  //#region server
  /**
   * Will get called when the server gets setup
   *
   * method to call: pluginCaller
   *
   * @returns a truthy value if the function ends
   */
  startServer?(): boolean;

  /**
   * Will get called when the server gets terminated.
   *
   * Node: the terminate function will not get called by default.
   *
   * method to call: pluginCaller
   *
   * @returns a truthy value if the function ends
   */
  stopServer?(): boolean;
  //#endregion
}
