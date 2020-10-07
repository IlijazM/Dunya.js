"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const path = require('path-extra');
const glob = require('glob');
function generateHTML(html, style, script) {
    return `${html}

<style scoped>
${style}
</style>

<script>
${script}
</script>`;
}
async function addTemplate(dev, dirName) {
    try {
        await fs.writeFile(path.join(dev.args.out, dirName, 'index.html'), await dev['getTemplate']());
    }
    catch (err) {
        console.error(err);
    }
}
async function addHtml(dev, dirName, html) {
    await fs.writeFile(path.join(dev.args.out, dirName, dirName + '.html'), html);
}
function findFile(dev, dirName, ext) {
    return new Promise((resolve, reject) => {
        const inDirName = path.join(dev.args.in, dirName);
        glob(path.join(inDirName, '*'), async (err, files) => {
            for (let filePath of files) {
                let fileContent = await fs.readFile(filePath);
                fileContent = fileContent.toString();
                const res = await dev.pluginPipe('pipeFile', { filePath, fileContent }, dev.args, false);
                filePath = res.filePath ?? filePath;
                fileContent = res.fileContent ?? fileContent;
                if (path.basename(filePath) === dirName + ext)
                    resolve(fileContent);
            }
            resolve('');
        });
    });
}
function getStyle(dev, dirName) {
    return findFile(dev, dirName, '.css');
}
function getScript(dev, dirName) {
    return findFile(dev, dirName, '.js');
}
function getHTML(dev, dirName) {
    return findFile(dev, dirName, '.inline-script');
}
let plugin = {
    name: '',
};
plugin.name = 'default-inline-script-compiler';
plugin.beforeWatchEventHalter = async function (dev, event, filePath) {
    const ext = path.extname(filePath);
    if (ext !== '.inline-script')
        return false;
    const dirName = path.dirname(filePath);
    if (dirName !== path.base(filePath))
        return false;
    const style = await getStyle(dev, dirName);
    const script = await getScript(dev, dirName);
    const html = await getHTML(dev, dirName);
    await addTemplate(dev, dirName);
    await addHtml(dev, dirName, generateHTML(html, style, script));
    return true;
};
exports.default = plugin;
