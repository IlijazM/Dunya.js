"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require('path-extra');
const sass = require('sass');
function filterExtensionName(path) {
    return Path.extname(path) !== '.scss';
}
function compileScss(fileContent) {
    return sass.renderSync({ data: fileContent }).css.toString();
}
function compile(path, fileContent) {
    try {
        return compileScss(fileContent);
    }
    catch (err) {
        console.error(`An error occurred while compiling '${path}':\n${err}`);
        return err.toString();
    }
}
function convertPath(path) {
    return Path.join(Path.dirname(path), Path.base(path) + '.css');
}
const plugin = {
    name: 'sass-support',
    priority: 300,
};
plugin.filePipe = function (pipe) {
    if (filterExtensionName(pipe.path))
        return;
    pipe.fileContent = compile(pipe.path, pipe.fileContent);
    pipe.path = convertPath(pipe.path);
    return pipe;
};
plugin.deleteEventPipe = function (pipe) {
    if (filterExtensionName(pipe.outputPath))
        return;
    pipe.outputPath = convertPath(pipe.outputPath);
    return pipe;
};
exports.default = plugin;
