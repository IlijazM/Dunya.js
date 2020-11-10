const Path = require('path-extra');
const glob = require('glob');
const fs = require('fs');

import DunyaPlugin from '../DunyaPlugin';

const PLUGIN_NAME = 'inline-script-optimizations';

function containsInlineScript(path: string): boolean {
  try {
    return fs.readdirSync(path).find((_: string) => _.endsWith('.inline-script'));
  } catch {
    return false;
  }
}

const plugin: DunyaPlugin = {
  name: PLUGIN_NAME,
  priority: 250,
};

plugin.filePipe = function (pipe: { path: string; fileContent: string }): { path: string; fileContent: string } {
  if (pipe.path === Path.join(this.args.outputDir, 'template.html')) return { path: '', fileContent: '' };

  const dirName = Path.dirname(pipe.path);
  const inputDirName = this.args.inputDir + dirName.substr(this.args.outputDir.length);

  if (containsInlineScript(inputDirName)) {
    const baseName = Path.basename(dirName);

    if (pipe.path === Path.join(dirName, baseName + '.inline-script')) return { path: '', fileContent: '' };
    if (pipe.path === Path.join(dirName, baseName + '.css')) return { path: '', fileContent: '' };
    if (pipe.path === Path.join(dirName, baseName + '.js')) return { path: '', fileContent: '' };
  }

  return;
};

export default plugin;
