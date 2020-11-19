"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
const jsdom = require("jsdom");
const express = require("express");
const Path = require('path-extra');
const glob = require('glob');
const fs = require('fs');
if (typeof fetch !== 'function') {
    global.fetch = require('node-fetch-polyfill');
    var fetch = require('node-fetch-polyfill');
}
/**
 * Sleeps for 'ms' milliseconds.
 *
 * @param ms the timeout in milliseconds.
 */
async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
exports.sleep = sleep;
async function getPreRenderedHTMLPage(pipe) {
    const path = pipe.path.substr(this.args.outputDir.length);
    const url = `http://localhost:${this.args.port}${path}`;
    const dom = await jsdom.JSDOM.fromURL(url, {
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
    });
    await sleep(200);
    console.log(dom.window.document.documentElement.outerHTML);
}
const PLUGIN_NAME = 'inline-script-compiler';
const plugin = {
    name: PLUGIN_NAME,
    priority: 250,
};
let expressApp;
let expressServer;
plugin.setup = function () {
    expressApp = express();
    expressApp.use(express.static(this.args.inputDir));
    expressServer = expressApp.listen(this.args.port, () => { });
};
plugin.terminate = function () {
    console.log('terminated');
    expressServer.close();
};
plugin.filePipe = function (pipe) {
    const ext = Path.extname(pipe.path);
    const baseName = Path.basename(pipe.path);
    if (baseName === 'index.html') {
        getPreRenderedHTMLPage.call(this, pipe).catch(console.error);
        return { path: '', fileContent: '' };
    }
    if (ext === '.html')
        return { path: '', fileContent: '' };
    return;
};
exports.default = plugin;
