"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
let plugin = {
    name: '',
};
plugin.name = 'default-validate-in-directory';
plugin.validate = async function (dev) {
    if (!fs.existsSync(dev.args.in))
        fs.mkdirSync(dev.args.in);
};
exports.default = plugin;
