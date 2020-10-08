"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require('glob');
const fs = require('fs-extra');
const path = require('path-extra');
async function compileHtml(dev, event, filePath) {
    const dirName = filePath.substr(0, filePath.length - path.extname(filePath).length);
    if (event === 'unlink') {
        await fs.remove(path.join(dev.args.out, dirName));
        return true;
    }
    await fs.mkdirs(path.join(dev.args.out, dirName), (err) => { });
    try {
        await fs.writeFile(path.join(dev.args.out, dirName, 'index.html'), await dev['getTemplate']());
    }
    catch (err) {
        console.error(err);
    }
    const from = path.join(dev.args.in, filePath);
    const to = path.join(dev.args.out, dirName, path.basename(dirName)) + '.html';
    console.log(from + ' -> ' + to);
    await fs.copyFile(from, to);
    return true;
}
async function compileTemplate(dev, event, filePath) {
    glob(path.join(dev.args.out, '**/index.html'), (err, files) => {
        files.forEach(async (file) => {
            const dirname = path.dirname(file);
            const basename = path.basename(dirname);
            const pathName = path.join(dirname, basename + '.html');
            if (!fs.existsSync(pathName))
                return;
            await fs.writeFile(file, await dev['getTemplate']());
        });
    });
    return false;
}
let plugin = {
    name: '',
};
plugin.name = 'default-html-compiler';
plugin.beforeWatchEventHalter = async function (dev, event, filePath) {
    const ext = path.extname(filePath);
    if (ext !== '.html')
        return false;
    if (path.basename(filePath) === 'template.html')
        return compileTemplate(dev, event, filePath);
    return compileHtml(dev, event, filePath);
};
exports.default = plugin;
