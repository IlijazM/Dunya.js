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
plugin.pipeFile = async function ({ filePath, fileContent }, args, onDelete) {
    const originalFilePath = filePath;
    const ext = path.extname(filePath);
    if (ext !== '.scss')
        return undefined;
    const endIndex = filePath.length - path.extname(filePath).length;
    filePath = filePath.substr(0, endIndex) + '.css';
    if (onDelete)
        return { filePath };
    try {
        fileContent = await compileScss(fileContent);
    }
    catch (err) {
        console.error(`An error occurred while compiling ${originalFilePath}:\n${err}`);
        return undefined;
    }
    return { filePath, fileContent };
};
exports.default = plugin;
