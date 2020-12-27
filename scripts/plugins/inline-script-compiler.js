"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
const jsdom = require("jsdom");
const express = require("express");
const Path = require('path-extra');
const glob = require('glob');
const fs = require('fs');
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
async function getPreRenderedHTMLPage(self, pipe) {
    const path = pipe.path.substr(self.args.outputDir.length);
    const url = `http://localhost:${self.args.port}${path}`;
    const dom = await jsdom.JSDOM.fromURL(url, {
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
    });
    await untilFinished(dom);
    let preRenderedHTML = dom.window.document.documentElement;
    preRenderedHTML = optimize(preRenderedHTML);
    self.fs.write(pipe.path, preRenderedHTML.outerHTML);
}
function optimize(html) {
    const initialContentElements = html.querySelectorAll('*[initial-content]');
    initialContentElements.forEach((el) => {
        el.innerHTML = el.getAttribute('initial-content');
    });
    return html;
}
async function untilFinished(dom) {
    while (true) {
        await sleep(50);
        if (dom.window.document.body.hasAttribute('inline-script-compiler-finished'))
            break;
    }
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
        getPreRenderedHTMLPage(this, pipe)
            .catch((err) => {
            console.error(err);
        })
            .then(() => {
            console.log(`compiled '${pipe.path}'.`);
        });
        return { path: '', fileContent: '' };
    }
    if (ext === '.html')
        return { path: '', fileContent: '' };
    return;
};
exports.default = plugin;
