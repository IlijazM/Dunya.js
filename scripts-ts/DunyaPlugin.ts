import Dev from './Dev';
import IDevArgs from './Args';

export default interface DunyaPlugin {
  name: string;

  setup?(dev: Dev): void; // After all plugins have loaded
  afterWatcher?(dev: Dev): void; // After the watcher got initiated
  afterServer?(dev: Dev): void; // After the server got initiated

  terminate?(dev: Dev): void; // When the function 'terminate' gets called
  afterTerminate?(dev: Dev): void; // After everything shut down

  /**
   * Whenever a watcher event happens.
   *
   * @param event is the event what happened to the file. It could be:
   *              * add
   *              * addDir
   *              * change
   *              * delete
   * @param path is the path of the file in the input directory (The input directory name excluded).
   */
  watcherEvent?(dev: Dev, event: string, path: string): void;
  watcherEventHalter?(dev: Dev, event: string, path: string): boolean;
  /**
   * @param pipe the path and content of the file.
   * @param onDelete if the event is delete.
   */
  watcherEventPipe?(
    pipe: { path: string; content: string },
    dev: Dev,
    onDelete: boolean
  ): { path: string; content: string };

  readFile?(dev: Dev, path: string): void;
  readFileHalter?(dev: Dev, path: string): boolean;
  readFilePipe?(pipe: { path: string; content: string }, dev: Dev): { path: string; content: string };
  readFileSuccess?(dev: Dev, path: string): void;
  readFileHalterSuccess?(dev: Dev, path: string): boolean;
  readFileFailed?(dev: Dev, path: string): void;
  readFileHalterFailed?(dev: Dev, path: string): boolean;

  writeFile?(dev: Dev, path: string): void;
  writeFileHalter?(dev: Dev, path: string): boolean;
  writeFilePipe?(pipe: { path: string; content: string }, dev: Dev): { path: string; content: string };
  writeFileSuccess?(dev: Dev, path: string): void;
  writeFileHalterSuccess?(dev: Dev, path: string): boolean;
  writeFileFailed?(dev: Dev, path: string): void;
  writeFileHalterFailed?(dev: Dev, path: string): boolean;

  mkdirs?(dev: Dev, path: string): void;
  mkdirsHalter?(dev: Dev, path: string): boolean;
  mkdirsPipe?(pipe: { path: string; content: string }, dev: Dev): { path: string; content: string };
  mkdirsSuccess?(dev: Dev, path: string): void;
  mkdirsHalterSuccess?(dev: Dev, path: string): boolean;
  mkdirsFailed?(dev: Dev, path: string): void;
  mkdirsHalterFailed?(dev: Dev, path: string): boolean;

  isDir?(dev: Dev, path: string): void;
  isDirHalter?(dev: Dev, path: string): boolean;
  isDirPipe?(pipe: { path: string; content: string }, dev: Dev): { path: string; content: string };
  isDirSuccess?(dev: Dev, path: string): void;
  isDirHalterSuccess?(dev: Dev, path: string): boolean;
  isDirFailed?(dev: Dev, path: string): void;
  isDirHalterFailed?(dev: Dev, path: string): boolean;
}
