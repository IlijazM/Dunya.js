"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sane = require('sane');
const fs = require('fs-extra');
const Path = require('path-extra');
const glob = require('glob');
const liveServer = require('live-server');
//#endregion
//#region init
const plugin = {
    name: 'default',
    priority: 100,
};
//#endregion
//#region fs
plugin.fsRead = function (path) {
    return fs.readFileSync(path, 'utf-8');
};
plugin.fsWrite = function (path, fileContent) {
    this.fs.mkdirs(Path.dirname(path));
    fs.writeFileSync(path, fileContent, 'utf-8');
    return true;
};
plugin.fsMkdirs = function (dirs) {
    fs.mkdirsSync(dirs, () => { });
    return true;
};
plugin.fsRemove = function (path) {
    fs.removeSync(path);
    return true;
};
plugin.fsEmpty = function (path) {
    fs.emptyDirSync(path);
    return true;
};
plugin.fsIsDir = function (path) {
    return fs.lstatSync(path).isDirectory();
};
plugin.fsExists = function (path) {
    return fs.existsSync(path);
};
plugin.fsReadJSON = function (path) {
    try {
        return JSON.parse(this.read(path));
    }
    catch (err) {
        throw new Error(`An error occurred while parsing '${path}':\n${err}`);
    }
};
//#endregion
//#region watcher
function prepareDirectories() {
    this.fs.mkdirs(this.args.inputDir);
    this.fs.empty(this.args.outputDir);
}
function initializingWatcher() {
    const watcher = sane(this.args.inputDir);
    watcher.on('all', (event, path) => {
        watcherEvent.call(this, event, path);
    });
}
function watcherEvent(event, path) {
    if (event === 'delete')
        event = 'unlink';
    this.eventHandler(event, path);
}
function callWatcherEventOnEveryFile() {
    glob(Path.join(this.args.inputDir, '**', '*'), (err, files) => files.forEach((file) => this.eventHandler('add', file.substr(this.args.inputDir.length + 1))));
}
plugin.setupWatcher = function () {
    prepareDirectories.call(this);
    initializingWatcher.call(this);
    callWatcherEventOnEveryFile.call(this);
    return true;
};
//#endregion
//#region event handlers
plugin.deleteEvent = function (path) {
    this.fs.remove(path);
    return true;
};
plugin.addDirEvent = function (path) {
    this.fs.mkdirs(path);
    return true;
};
plugin.addFileEvent = function (path, fileContent) {
    this.fs.write(path, fileContent);
    return true;
};
plugin.changeFileEvent = function (path, fileContent) {
    this.fs.write(path, fileContent);
    return true;
};
//#endregion
//#region server
plugin.startServer = function () {
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
exports.default = plugin;
