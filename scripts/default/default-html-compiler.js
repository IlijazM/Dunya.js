"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require('glob');
const fs = require('fs-extra');
const path = require('path-extra');
async function compileTemplate(dev, event) {
    await glob(path.join(dev.args.in, '**/*.html'), async (err, files) => {
        if (err)
            throw err;
        for await (let filePath of files) {
            filePath = filePath.substr(dev.args.in.length + 1);
            if (filePath === 'template.html')
                continue;
            const { htmlFile, dirName, base, relativePath } = convertHtmlFilePaths(filePath);
            if (event === 'unlink') {
                await fs.remove(path.join(dev.args.out, dirName, base, 'index.html'));
                continue;
            }
            try {
                await fs.writeFile(path.join(dev.args.out, dirName, base, 'index.html'), await dev['getTemplate'](relativePath, htmlFile));
            }
            catch (err) {
                console.error(err);
            }
        }
    });
    return false;
}
function convertHtmlFilePaths(filePath) {
    let htmlFile = path.basename(filePath);
    let dirName = path.dirname(filePath);
    let base = path.base(filePath);
    if (htmlFile === 'index.html') {
        htmlFile = '_index.html';
        base = '';
    }
    const relativePath = dirName
        .split(/[\\\/]/gm)
        .map(() => '..')
        .join('/');
    return { htmlFile, dirName, base, relativePath };
}
async function compileHTML(dev, event, filePath) {
    const { htmlFile, dirName, base, relativePath } = convertHtmlFilePaths(filePath);
    await fs.mkdir(path.join(dev.args.out, dirName, base), (err) => { });
    if (event === 'unlink') {
        try {
            await fs.remove(path.join(dev.args.out, dirName, base, 'index.html'));
            await fs.remove(path.join(dev.args.out, dirName, base, htmlFile));
            await compileTemplate(dev, 'change');
        }
        catch (err) { }
        return true;
    }
    const from = path.join(dev.args.in, filePath);
    const to = path.join(dev.args.out, dirName, base, htmlFile);
    console.log(from + ' -> ' + to);
    await fs.copyFile(from, to);
    return true;
}
let plugin = {
    name: '',
};
plugin.name = 'default-html-compiler';
plugin.beforeWatchEventHalter = async function (dev, event, filePath) {
    const fileName = path.basename(filePath);
    if (fileName === 'template.html')
        return await compileTemplate(dev, event);
    const extension = path.extname(fileName);
    if (extension === '.html')
        return await compileHTML(dev, event, filePath);
    return false;
};
exports.default = plugin;
