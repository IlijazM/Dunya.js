"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
let plugin = {
    name: '',
};
plugin.name = 'default-plugin-validate-in-directory';
plugin.validate = async function (args) {
    if (!fs.existsSync(args.in))
        fs.mkdirSync(args.in);
};
exports.default = plugin;
