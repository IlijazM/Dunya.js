import { pipeline } from 'stream';
import DunyaPlugin from '../DunyaPlugin';

const Path = require('path-extra');

const PLUGIN_NAME = 'enhancedRouting';

function filterExceptions(pipe: { path: string; fileContent: string }): boolean {
  for (const exception of this.exceptions) {
    if (exception.call(this, PLUGIN_NAME, pipe)) return true;
  }
  return false;
}

function filterExtensionName(pipe: { path: string; fileContent: string }): boolean {
  return Path.extname(pipe.path) !== '.html';
}

function isIndex(pipe: { path: string; fileContent: string }): boolean {
  return Path.basename(pipe.path) === 'index.html';
}

function convertPath(path: string): string {
  return Path.join(Path.dirname(path), Path.base(path), 'index.html');
}

const plugin: DunyaPlugin = {
  name: PLUGIN_NAME,
  priority: 240,
};

plugin.filePipe = function (pipe: { path: string; fileContent: string }): { path: string; fileContent: string } {
  if (filterExceptions.call(this, pipe)) return;
  if (filterExtensionName(pipe)) return;
  if (isIndex(pipe)) return;
  pipe.path = convertPath(pipe.path);

  return pipe;
};

export default plugin;
