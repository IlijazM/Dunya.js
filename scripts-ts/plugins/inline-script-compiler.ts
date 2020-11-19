import * as jsdom from 'jsdom';
import * as express from 'express';

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
export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

import DunyaPlugin from '../DunyaPlugin';

async function getPreRenderedHTMLPage(pipe: { path: string; fileContent: string }) {
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

const plugin: DunyaPlugin = {
  name: PLUGIN_NAME,
  priority: 250,
};

let expressApp: any;
let expressServer: any;
plugin.setup = function () {
  expressApp = express();
  expressApp.use(express.static(this.args.inputDir));
  expressServer = expressApp.listen(this.args.port, () => {});
};

plugin.terminate = function () {
  console.log('terminated');
  expressServer.close();
};

plugin.filePipe = function (pipe: { path: string; fileContent: string }): { path: string; fileContent: string } {
  const ext = Path.extname(pipe.path);
  const baseName = Path.basename(pipe.path);

  if (baseName === 'index.html') {
    getPreRenderedHTMLPage.call(this, pipe).catch(console.error);
    return { path: '', fileContent: '' };
  }

  if (ext === '.html') return { path: '', fileContent: '' };

  return;
};

export default plugin;
