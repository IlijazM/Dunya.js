"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require('path');
const glob = require('glob');
function filterExtensionName(pipe) {
    return Path.extname(pipe.path) !== '.html';
}
function getTemplateInputPath() {
    return Path.join(this.args.inputDir, 'template.html');
}
function getTemplateOutputPath() {
    return Path.join(this.args.outputDir, 'template.html');
}
function templateFileExists() {
    return this.fs.exists(getTemplateInputPath.call(this));
}
function loadTemplate() {
    return this.fs.read(getTemplateInputPath.call(this));
}
function isTemplateFile(pipe) {
    return pipe.path === getTemplateOutputPath.call(this);
}
function evalTemplate(template, path, html) {
    let relativePath = Path.dirname(path)
        .split(/[\\\/]/gm)
        .map((_) => (_ == '.' ? undefined : '..'))
        .filter((_, i) => _ && i !== 0)
        .join('/');
    if (relativePath !== '')
        relativePath += '/';
    const self = this;
    function load(path) {
        return self.fs.read(Path.join(self.args.inputDir, path));
    }
    template = template.split(`\n`).join(`\\n`);
    const regex = /\{\{(.*?)\}\}/gm;
    let m;
    while ((m = regex.exec(template)) !== null) {
        if (m.index === regex.lastIndex)
            regex.lastIndex++;
        const match = m[0];
        const index = m.index;
        let res;
        try {
            res = eval(match.substring(2, match.length - 2));
        }
        catch (err) {
            throw new Error(`An error occurred while compiling '${getTemplateInputPath.call(this)}':\n\`${match.substring(2, match.length - 2)}\`\n${err}`);
        }
        if (res === undefined)
            res = '';
        if (typeof res === 'object')
            res = JSON.stringify(res);
        template = template.substring(0, index) + res.toString() + template.substr(index + match.length);
        regex.lastIndex += match.length;
    }
    template = template.replace(/\\n/gm, `\n`);
    template = template.replace(/\"\~\//gm, `"${relativePath}`);
    return template;
}
/**
 * @param path the path to the .html file
 * @param html the content of the .html fle
 *
 * @returns the new content of the .html file
 */
function compileTemplate(path, html) {
    let template = loadTemplate.call(this);
    try {
        template = evalTemplate.call(this, template, path, html);
    }
    catch (err) {
        console.error(err);
    }
    return template;
}
function compileTemplateFile(pipe) {
    this.fs.write(getTemplateOutputPath.call(this), pipe.fileContent);
    updateAllHTMLFiles.call(this);
}
function updateAllHTMLFiles() {
    glob(Path.join(this.args.inputDir, '**', '*.html'), (err, files) => {
        files.forEach((file) => {
            if (file === getTemplateInputPath.call(this))
                return;
            file = file.substr(this.args.inputDir.length + 1);
            this.eventHandler('change', file);
        });
    });
}
const plugin = {
    name: 'template',
    priority: 100,
};
plugin.setup = function () {
    this.exceptions.push(function (pluginName, pipe) {
        return pluginName === 'enhancedRouting' && pipe.path === Path.join(this.args.outputDir, 'template.html');
    });
};
plugin.filePipe = function (pipe) {
    if (filterExtensionName.call(this, pipe))
        return;
    if (!templateFileExists.call(this))
        return;
    if (isTemplateFile.call(this, pipe))
        return compileTemplateFile.call(this, pipe);
    pipe.fileContent = compileTemplate.call(this, pipe.path, pipe.fileContent);
    return pipe;
};
plugin.deleteEventPipe = function (pipe) {
    if (!isTemplateFile.call(this, { path: pipe.outputPath }))
        return;
    this.fs.remove(getTemplateOutputPath.call(this));
    updateAllHTMLFiles.call(this);
    return pipe;
};
exports.default = plugin;
