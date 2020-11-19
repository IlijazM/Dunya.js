//#region imports dependencies
import Pipe from '../Pipe';
import DunyaPlugin from '../DunyaPlugin';

const sane = require('sane');
const fs = require('fs-extra');
const Path = require('path-extra');
const glob = require('glob');
const liveServer = require('live-server');
//#endregion

//#region init
const plugin: DunyaPlugin = {
  name: 'default',
  priority: 100,
};
//#endregion

//#region fs
plugin.fsRead = function (path: string): string {
  return fs.readFileSync(path, 'utf-8');
};

plugin.fsWrite = function (path: string, fileContent: string): boolean {
  if (!path) return;
  this.fs.mkdirs(Path.dirname(path));
  fs.writeFileSync(path, fileContent, 'utf-8');
  return true;
};

plugin.fsMkdirs = function (dirs: string): boolean {
  fs.mkdirsSync(dirs, () => {});
  return true;
};

plugin.fsRemove = function (path: string): boolean {
  fs.removeSync(path);
  return true;
};

plugin.fsEmpty = function (path: string): boolean {
  fs.emptyDirSync(path);
  return true;
};

plugin.fsIsDir = function (path: string): boolean {
  return fs.lstatSync(path).isDirectory();
};

plugin.fsExists = function (path: string): boolean {
  return fs.existsSync(path);
};

plugin.fsReadJSON = function (path: string): Record<string, any> {
  try {
    return JSON.parse(this.read(path));
  } catch (err) {
    throw new Error(`An error occurred while parsing '${path}':\n${err}`);
  }
};
//#endregion

//#region watcher
function prepareDirectories() {
  this.fs.mkdirs(this.args.inputDir);
  this.fs.empty(this.args.outputDir);
}

let watcher;
function initializingWatcher() {
  watcher = sane(this.args.inputDir);
  watcher.on('all', (event: string, path: string) => {
    watcherEvent.call(this, event, path);
  });
}

function watcherEvent(event: string, path: string) {
  if (event === 'delete') event = 'unlink';
  this.eventHandler(event, path);
}

function callWatcherEventOnEveryFile() {
  glob(Path.join(this.args.inputDir, '**', '*'), (err: any, files: Array<string>) =>
    files.forEach((file: string) => this.eventHandler('add', file.substr(this.args.inputDir.length + 1)))
  );
}

plugin.setupWatcher = function (): boolean {
  prepareDirectories.call(this);
  initializingWatcher.call(this);
  callWatcherEventOnEveryFile.call(this);
  return true;
};

plugin.terminateWatcher = function (): boolean {
  watcher.close();
  return true;
};
//#endregion

//#region event handlers
plugin.deleteEvent = function (path: string): boolean {
  this.fs.remove(path);
  return true;
};

plugin.addDirEvent = function (path: string): boolean {
  this.fs.mkdirs(path);
  return true;
};

plugin.addFileEvent = function (path: string, fileContent: string): boolean {
  this.fs.write(path, fileContent);
  return true;
};

plugin.changeFileEvent = function (path: string, fileContent: string): boolean {
  this.fs.write(path, fileContent);
  return true;
};
//#endregion

//#region server
plugin.startServer = function (): boolean {
  const params = {
    port: this.args.port,
    host: this.args.ip,
    root: this.args.outputDir,
    open: false,
    noCssInject: true,
  };
  liveServer.start(params);
  return true;
};
//#endregion

export default plugin;
