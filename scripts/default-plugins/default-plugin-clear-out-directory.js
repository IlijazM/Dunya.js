"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const path = require('path');
let plugin = {
    name: '',
};
plugin.name = 'default-plugin-clear-out-directory';
plugin.validate = async function (args) {
    const pathName = path.join(args.modulePath, args.out);
    await fs.emptyDir(pathName); // This will also create a new directory if needed.
};
exports.default = plugin;
