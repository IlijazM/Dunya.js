"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const path = require('path');
function compileTemplate(template, relativePath, htmlFile, args) {
    const props = args.props;
    template = template.replace(/\"\~\//gm, '"' + relativePath + '/');
    const regex = /\*\{\{(.*?)\}\}/gm;
    let m;
    while ((m = regex.exec(template)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        const match = m[0];
        const index = m.index;
        let res = eval(match.substr(1));
        if (res === undefined) {
            res = '';
        }
        if (typeof res === 'object')
            res = JSON.stringify(res);
        template =
            template.substring(0, index) +
                res.toString() +
                template.substr(index + match.length);
        regex.lastIndex += res.toString().length;
    }
    return template;
}
let plugin = {
    name: '',
};
plugin.name = 'default-link-template-file';
plugin.setup = async function (dev) {
    dev['getTemplate'] = async function (relativePath, htmlFile) {
        const pathName = path.join(this.args.in, 'template.html');
        if (!fs.existsSync(pathName))
            throw new Error(`Missing '${pathName}'.`);
        let template = (await fs.readFile(pathName)).toString();
        return compileTemplate(template, relativePath, htmlFile, dev.args);
    };
};
exports.default = plugin;
