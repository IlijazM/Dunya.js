import * as jsdom from 'jsdom';
import * as express from 'express';

import DunyaPlugin from '../../src/pipe/plugin/PipePluginModel';
import Pipe from '../Pipe';

const Path = require('path-extra');
const glob = require('glob');
const fs = require('fs');

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

async function getPreRenderedHTMLPage(self: Pipe, pipe: { path: string; fileContent: string }) {
  const path = pipe.path.substr(self.args.outputDir.length);

  const url = `http://localhost:${self.args.port}${path}`;
  const dom = await jsdom.JSDOM.fromURL(url, {
    resources: 'usable',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });

  await untilFinished(dom);

  let preRenderedHTML: HTMLElement = dom.window.document.documentElement;

  preRenderedHTML = optimize(preRenderedHTML);

  self.fs.write(pipe.path, preRenderedHTML.outerHTML);
}

function optimize(html: HTMLElement): HTMLElement {
  const initialContentElements = html.querySelectorAll('*[initial-content]');

  initialContentElements.forEach((el) => {
    el.innerHTML = el.getAttribute('initial-content');
  });

  return html;
}

async function untilFinished(dom: jsdom.JSDOM) {
  while (true) {
    await sleep(50);
    if (dom.window.document.body.hasAttribute('inline-script-compiler-finished')) break;
  }
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

plugin.filePipe = function (pipe: {
  path: string;
  fileContent: string;
}): { path: string; fileContent: string } {
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

  if (ext === '.html') return { path: '', fileContent: '' };

  return;
};

export default plugin;
