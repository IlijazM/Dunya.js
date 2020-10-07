"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const path = require('path');
let plugin = {
    name: '',
};
plugin.name = 'default-clear-out-directory';
plugin.validate = async function (dev) {
    const pathName = path.join(dev.args.modulePath, dev.args.out);
    await fs.mkdirs(pathName, (err) => { });
    await fs.emptyDir(pathName);
};
exports.default = plugin;
