"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const path = require('path');
let plugin = {
    name: '',
};
plugin.name = 'default-link-template-file';
plugin.setup = async function (dev) {
    dev['getTemplate'] = async function () {
        const pathName = path.join(this.args.in, 'template.html');
        if (!fs.existsSync(pathName))
            throw new Error(`Missing '${pathName}'.`);
        return (await fs.readFile(pathName)).toString();
    };
};
exports.default = plugin;
