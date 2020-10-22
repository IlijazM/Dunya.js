export default interface DunyaPlugin {
  name: string;
  /**
   * The priority of the plugin.
   * Plugins with a greater priority will get executed earlier.
   * The default priority is 0 but the priority of the default plugin is 100.
   */
  priority?: number;

  //#endregion setup and terminate
  setup?(): void;
  terminate?(): void;
  //#endregion

  //#region fs
  fsRead?(path: string): string;
  fsWrite?(path: string, fileContent: string): boolean;
  fsMkdirs?(dirs: string): boolean;
  fsRemove?(path: string): boolean;
  fsEmpty?(path: string): boolean;
  fsIsDir?(path: string): boolean;
  fsExists?(path: string): boolean;
  fsReadJSON?(path: string): Record<string, any>;
  //#endregion

  //#region watcher
  setupWatcher?(): boolean;
  terminateWatcher?(): boolean;
  //#endregion

  //#region event handlers
  /**
   * @param pipe.path the output directory
   */
  deleteEventPipe?(pipe: { path: string }): { path: string };
  /**
   * @param path the output directory
   */
  deleteEvent?(path: string): boolean;

  /**
   * @param pipe.path the output directory
   */
  addDirEventPipe?(pipe: { path: string }): { path: string };
  /**
   * @param path the output directory
   */
  addDirEvent?(path: string): boolean;

  /**
   * Will get called on the 'add' event as well as on the 'change' event before 'addFileEventPipe' or 'changeFileEventPipe'
   *
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   */
  filePipe?(pipe: { path: string; fileContent: string }): { path: string; fileContent: string };

  /**
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   */
  addFileEventPipe?(pipe: { path: string; fileContent: string }): { path: string; fileContent: string };
  /**
   * @param path the output directory
   */
  addFileEvent?(path: string, fileContent: string): boolean;

  /**
   * @param pipe.path the output directory
   * @param pipe.fileContent the content of the file
   */
  changeFileEventPipe?(pipe: { path: string; fileContent: string }): { path: string; fileContent: string };
  /**
   * @param path the output directory
   */
  changeFileEvent?(path: string, fileContent: string): boolean;

  //#endregion

  //#region server
  startServer?(): boolean;
  stopServer?(): boolean;
  //#endregion
}
