"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const path = require('path-extra');
const glob = require('glob');
function generateHTML(html, style, script) {
    html = html ?? '';
    style = style ?? '';
    script = script ?? '';
    html = html.trim();
    style = style.trim();
    script = script.trim();
    return `${html}

<style scoped>
${style}
</style>

<script>
${script}
</script>`;
}
async function addTemplate(dev, dirName, htmlFile) {
    try {
        let relativePath = dirName
            .split(/[\\\/]/gm)
            .map((_) => '..')
            .join('/');
        await fs.mkdirs(path.join(dev.args.out, dirName), (err) => { });
        await fs.writeFile(path.join(dev.args.out, dirName, 'index.html'), await dev['getTemplate'](relativePath, htmlFile));
    }
    catch (err) {
        console.error(err);
    }
}
async function addHtml(dev, dirName, htmlFile, html) {
    await fs.writeFile(path.join(dev.args.out, dirName, htmlFile), html);
}
async function findFile(dev, dirName, base, ext) {
    const inDirName = path.join(dev.args.in, dirName);
    let filePath = (await dev.getFile(dev.args, path.join(inDirName, base + ext))) ?? path.join(inDirName, base + ext);
    if (!fs.existsSync(filePath))
        return {
            filePath: null,
            fileContent: null,
        };
    let fileContent = await fs.readFile(filePath);
    fileContent = fileContent.toString();
    const res = await dev.pluginPipe('pipeFile', { filePath, fileContent }, dev.args, false);
    filePath = res.filePath ?? filePath;
    fileContent = res.fileContent ?? fileContent;
    return { filePath, fileContent };
}
async function compileTemplate(dev, event) {
    await glob(path.join(dev.args.in, '**/*.inline-script'), async (err, files) => {
        if (err)
            throw err;
        for await (let filePath of files) {
            filePath = filePath.substr(dev.args.in.length + 1);
            const { htmlFile, dirName, base, relativePath } = convertInlineScriptFilePaths(filePath);
            if (event === 'unlink') {
                await fs.remove(path.join(dev.args.out, dirName, 'index.html'));
                continue;
            }
            try {
                await fs.writeFile(path.join(dev.args.out, dirName, 'index.html'), await dev['getTemplate'](relativePath, htmlFile));
            }
            catch (err) {
                console.error(err);
            }
        }
    });
    return false;
}
function getStyle(dev, dirName, base) {
    return findFile(dev, dirName, base, '.css');
}
function getScript(dev, dirName, base) {
    return findFile(dev, dirName, base, '.js');
}
function getHTML(dev, dirName, base) {
    return findFile(dev, dirName, base, '.inline-script');
}
function convertInlineScriptFilePaths(filePath) {
    let htmlFile = path.basename(filePath);
    let dirName = path.dirname(filePath);
    let base = path.base(filePath);
    if (base === 'index') {
        htmlFile = '_index.html';
        dirName = dirName.substr(0, dirName.length - path.basename(dirName).length);
    }
    let relativePath = dirName
        .split(/[\\\/]/gm)
        .map(() => '..')
        .join('/');
    if (dirName === '')
        relativePath = '.';
    return { htmlFile, dirName, base, relativePath };
}
async function inlineScriptCompiler(dev, event, filePath) {
    const initialDirName = path.dirname(filePath);
    const { htmlFile, dirName, base, relativePath } = convertInlineScriptFilePaths(filePath);
    const style = (await getStyle(dev, initialDirName, base)).fileContent;
    const script = (await getScript(dev, initialDirName, base)).fileContent;
    if (event === 'unlink') {
        if (style)
            await fs.writeFile(path.join(dev.args.out, dirName, base + '.css'), style);
        if (script)
            await fs.writeFile(path.join(dev.args.out, dirName, base + '.js'), script);
        await fs.unlink(path.join(dev.args.out, dirName, base + '.html'));
        await fs.unlink(path.join(dev.args.out, dirName, 'index.html'));
        return true;
    }
    const html = (await getHTML(dev, initialDirName, base)).fileContent;
    if (style !== null)
        await fs.unlink(path.join(dev.args.out, dirName, base + '.css'), (err) => { });
    if (script !== null)
        await fs.unlink(path.join(dev.args.out, dirName, base + '.js'), (err) => { });
    await fs.mkdirs(path.join(dev.args.out, dirName), (err) => { });
    await addTemplate(dev, dirName, htmlFile);
    await addHtml(dev, dirName, htmlFile, generateHTML(html, style, script));
    return true;
}
async function updateInlineScriptFile(dev, inlineScriptPath) {
    dev.eventHandler('change', inlineScriptPath);
    return true;
}
let plugin = {
    name: '',
};
plugin.name = 'default-inline-script-compiler';
plugin.beforeWatchEventHalter = async function (dev, event, filePath) {
    if (path.basename(filePath) === 'template.html') {
        compileTemplate(dev, event);
        return false;
    }
    const ext = path.extname(filePath);
    const dirName = path.dirname(filePath);
    if (ext === '.inline-script') {
        if (path.base(dirName) !== path.base(filePath))
            return false;
        return await inlineScriptCompiler(dev, event, filePath);
    }
    const inlineScriptFile = await findFile(dev, dirName, path.base(filePath), '.inline-script');
    const inlineScriptPath = inlineScriptFile.filePath;
    if (inlineScriptPath !== null)
        return await updateInlineScriptFile(dev, inlineScriptPath);
    return false;
};
exports.default = plugin;
