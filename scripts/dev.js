"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');
const argumentHandler_js_1 = require("./argumentHandler.js");
const common = require("./common.js");
class dev {
    constructor(dirName, userArgs) {
        this.dirName = dirName;
        this.userArgs = userArgs;
        this.args = {
            config: 'dunya.config.json',
            ip: '0.0.0.0',
            port: 8080,
            in: 'src',
            out: 'string',
            props: {},
        };
        this.argumentProvider();
    }
    getConfigPath() {
        return this.userArgs.config ?? this.args.config;
    }
    configProvider() {
        const configPath = this.getConfigPath();
        this.configArgs = common.loadAndParseJSONSafe(configPath);
    }
    argumentProvider() {
        argumentHandler_js_1.default(this.args, this.configArgs, this.userArgs);
    }
}
exports.default = dev;
