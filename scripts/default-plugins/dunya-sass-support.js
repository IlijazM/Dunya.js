"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const path = require('path');
const sass = require('sass');
async function compileScss(code) {
    return sass
        .renderSync({
        data: code,
    })
        .css.toString();
}
let plugin = {
    name: '',
};
plugin.name = 'dunya-sass-support';
plugin.pipeFile = async function (args, { filePath, fileContent }, onDelete) {
    const ext = path.extname(filePath);
    if (ext !== 'scss')
        return undefined;
    const endIndex = filePath.length - path.extname(filePath).length;
    filePath = filePath.substr(0, endIndex) + '.css';
    if (onDelete)
        return { filePath };
    fileContent = await compileScss(fileContent);
    return { filePath, fileContent };
};
exports.default = plugin;
