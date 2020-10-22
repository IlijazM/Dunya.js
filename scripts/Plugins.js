"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let plugin = {
    name: '',
    priority: 100,
};
//#region setup and terminate
plugin.setup = function () {
    return this.pluginCallAll('setup');
};
plugin.terminate = function () {
    return this.pluginCallAll('terminate');
};
//#endregion
//#region fs
plugin.fsRead = function (path) {
    return this.pluginGetter('fsRead', path);
};
plugin.fsWrite = function (path, fileContent) {
    return this.pluginCaller('fsWrite', path, fileContent);
};
plugin.fsMkdirs = function (path) {
    return this.pluginCaller('fsMkdirs', path);
};
plugin.fsRemove = function (path) {
    return this.pluginCaller('fsRemove', path);
};
plugin.fsEmpty = function (path) {
    return this.pluginCaller('fsEmpty', path);
};
plugin.fsIsDir = function (path) {
    return this.pluginGetter('fsIsDir', path);
};
plugin.fsExists = function (path) {
    return this.pluginGetter('fsExists', path);
};
plugin.fsReadJSON = function (path) {
    return this.pluginGetter('fsReadJSON', path);
};
//#endregion
//#region watcher
plugin.setupWatcher = function () {
    return this.pluginCaller('setupWatcher');
};
plugin.terminateWatcher = function () {
    return this.pluginCaller('terminateWatcher');
};
//#endregion
//#region events handlers
plugin.deleteEventPipe = function (pipe) {
    return this.pluginPipe('deleteEventPipe', pipe);
};
plugin.deleteEvent = function (path) {
    return this.pluginCaller('deleteEvent', path);
};
plugin.addDirEventPipe = function (pipe) {
    return this.pluginPipe('addDirEventPipe', pipe);
};
plugin.addDirEvent = function (path) {
    return this.pluginCaller('addDirEvent', path);
};
plugin.filePipe = function (pipe) {
    return this.pluginPipe('filePipe', pipe);
};
plugin.addFileEventPipe = function (pipe) {
    return this.pluginPipe('addFileEventPipe', pipe);
};
plugin.addFileEvent = function (path, fileContent) {
    return this.pluginCaller('addFileEvent', path, fileContent);
};
plugin.changeFileEventPipe = function (pipe) {
    return this.pluginPipe('changeFileEventPipe', pipe);
};
plugin.changeFileEvent = function (path, fileContent) {
    return this.pluginCaller('changeFileEvent', path, fileContent);
};
plugin.startServer = function () {
    return this.pluginCaller('startServer');
};
plugin.stopServer = function () {
    return this.pluginCaller('stopServer');
};
exports.default = plugin;
