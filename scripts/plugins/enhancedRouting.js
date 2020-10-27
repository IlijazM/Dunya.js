"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require('path-extra');
const PLUGIN_NAME = 'enhancedRouting';
function filterExceptions(pipe) {
    for (const exception of this.exceptions) {
        if (exception.call(this, PLUGIN_NAME, pipe))
            return true;
    }
    return false;
}
function filterExtensionName(pipe) {
    return Path.extname(pipe.path) !== '.html';
}
function isIndex(pipe) {
    return Path.basename(pipe.path) === 'index.html';
}
function convertPath(path) {
    return Path.join(Path.dirname(path), Path.base(path), 'index.html');
}
const plugin = {
    name: PLUGIN_NAME,
    priority: 240,
};
plugin.filePipe = function (pipe) {
    if (filterExceptions.call(this, pipe))
        return;
    if (filterExtensionName(pipe))
        return;
    if (isIndex(pipe))
        return;
    pipe.path = convertPath(pipe.path);
    return pipe;
};
exports.default = plugin;
