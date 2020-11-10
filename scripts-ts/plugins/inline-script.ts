const Path = require('path-extra');
const glob = require('glob');
const fs = require('fs');

import DunyaPlugin from '../DunyaPlugin';

const PLUGIN_NAME = 'inline-script';

//#region template
function filterExtensionName(path: string): boolean {
  return Path.extname(path) !== '.html';
}

function getTemplateInputPath(): string {
  return Path.join(this.args.inputDir, 'template.html');
}

function getTemplateOutputPath(): string {
  return Path.join(this.args.outputDir, 'template.html');
}

function templateFileExists(): boolean {
  return this.fs.exists(getTemplateInputPath.call(this));
}

function loadTemplate(): string {
  return this.fs.read(getTemplateInputPath.call(this));
}

function isTemplateFile(path: string): boolean {
  return path === getTemplateOutputPath.call(this);
}

function evalTemplate(template: string, path: string, html: string): string {
  let relativePath = Path.dirname(path)
    .split(/[\\\/]/gm)
    .map((_) => (_ == '.' ? undefined : '..'))
    .filter((_, i) => _ && i !== 0)
    .join('/');

  if (relativePath !== '') relativePath += '/';

  const self = this;

  function load(path: string): string {
    return self.fs.read(Path.join(self.args.inputDir, path));
  }

  template = template.split(`\n`).join(`\\n`);

  const regex = /\{\{(.*?)\}\}/gm;

  let m: RegExpMatchArray;
  while ((m = regex.exec(template)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++;

    const match = m[0];
    const index = m.index;

    let res: any;
    try {
      res = eval(match.substring(2, match.length - 2));
    } catch (err) {
      throw new Error(
        `An error occurred while compiling '${getTemplateInputPath.call(this)}':\n\`${match.substring(
          2,
          match.length - 2
        )}\`\n${err}`
      );
    }

    if (res === undefined) res = '';
    if (typeof res === 'object') res = JSON.stringify(res);

    template = template.substring(0, index) + res.toString() + template.substr(index + match.length);
    regex.lastIndex += match.length;
  }

  template = template.replace(/\\n/gm, `\n`);
  template = template.replace(/\"\~\//gm, `"${relativePath}`);

  return template;
}

function getIndexPath(path: string): string {
  return Path.join(Path.dirname(path), 'index.html');
}

function addTemplate(path: string, fileContent: string) {
  const html = Path.basename(path);

  let template = loadTemplate.call(this);
  try {
    template = evalTemplate.call(this, template, path, html);
  } catch (err) {
    console.error(err);
  }
  this.fs.write(getIndexPath.call(this, path), template);
}

function removeHtmlDirectory(path: string) {
  path = Path.join(Path.dirname(path), Path.base(path));
  this.fs.remove(path);
}

function compileTemplateFile(fileContent: string): any {
  this.fs.write(getTemplateOutputPath.call(this), fileContent);
  updateAllHTMLFiles.call(this);
}

function updateAllHTMLFiles() {
  const templateExists = templateFileExists.call(this);

  function update(files: Array<string>) {
    files.forEach((file: string) => {
      if (templateExists) {
        if (file === getTemplateInputPath.call(this)) return;
        file = file.substr(this.args.inputDir.length + 1);
        this.eventHandler('change', file);
      } else {
        file = Path.join(this.args.outputDir, file.substr(this.args.inputDir.length + 1));
        file = getIndexPath(file);
        this.fs.remove(file);
      }
    });
  }

  glob(Path.join(this.args.inputDir, '**', '*.html'), (err: any, files: Array<string>) => {
    update.call(this, files);
  });
  glob(Path.join(this.args.inputDir, '**', '*.inline-script'), (err: any, files: Array<string>) => {
    update.call(this, files);
  });
}

const plugin: DunyaPlugin = {
  name: PLUGIN_NAME,
  priority: 250,
};

plugin.setup = function () {
  this.exceptions.push(function (pluginName: string, pipe: { path: string; fileContent: string }): boolean {
    return pluginName === PLUGIN_NAME && pipe.path === Path.join(this.args.outputDir, 'template.html');
  });

  this.exceptions.push(function (pluginName: string, pipe: { path: string; fileContent: string }): boolean {
    const split = pipe.path.split('/');
    return pluginName === PLUGIN_NAME && (split.includes('lib') || split.includes('components'));
  });
};

plugin.fileEvent = function (path: string, fileContent: string): boolean {
  if (filterExtensionName(path)) return;
  if (!templateFileExists.call(this)) return;
  if (isTemplateFile.call(this, path)) return compileTemplateFile.call(this, fileContent);

  addTemplate.call(this, path, fileContent);

  return;
};

plugin.deleteEvent = function (path: string): boolean {
  if (isInlineScriptFile(path)) return unlinkInlineScript.call(this, path);
  if (filterExtensionName(path)) return;
  if (isTemplateFile.call(this, path)) {
    this.fs.remove(path);
    updateAllHTMLFiles.call(this);
  } else {
    removeHtmlDirectory.call(this, path);
  }

  return;
};
//#endregion

//#region enhanced routing
function filterExceptions(pipe: { path: string; fileContent: string }): boolean {
  for (const exception of this.exceptions) {
    if (exception.call(this, PLUGIN_NAME, pipe)) return true;
  }
  return false;
}

function isIndex(path: string): boolean {
  return Path.basename(path) === 'index.html';
}

function convertPath(path: string): string {
  return Path.join(Path.dirname(path), Path.base(path), '_index.html');
}

plugin.filePipe = function (pipe: { path: string; fileContent: string }): { path: string; fileContent: string } {
  if (filterExceptions.call(this, pipe)) return;
  if (filterExtensionName(pipe.path)) return;
  if (isIndex(pipe.path)) {
    pipe.path = Path.join(Path.dirname(pipe.path), '_index.html');
    return pipe;
  }
  pipe.path = convertPath(pipe.path);

  return pipe;
};
//#endregion

//#region inline script
function containsInlineScript(path: string): boolean {
  try {
    return fs.readdirSync(path).find((_: string) => _.endsWith('.inline-script'));
  } catch {
    return false;
  }
}

function read(path: string, ext: string): string {
  const pathRaw = path.substr(this.args.outputDir.length + 1);
  const base = Path.base(pathRaw);
  try {
    return this.fs.read(Path.join(this.args.outputDir, pathRaw, base + ext));
  } catch (err) {
    try {
      return this.fs.read(Path.join(this.args.outputDir, pathRaw, 'index' + ext));
    } catch (err) {
      return null;
    }
  }
}

function joinInlineScript(html: string, css: string, js: string): string {
  return `${html}${css ? `<style scoped>${css}</style>` : ''}${js ? `<script>${js}</script>` : ''}`;
}

function isInlineScriptFile(path: string): boolean {
  return Path.extname(path) === '.inline-script';
}

function unlinkInlineScript(path: string): any {
  this.fs.remove(Path.join(Path.dirname(path), '_index.html'));
  this.fs.remove(Path.join(Path.dirname(path), 'index.html'));
}

function updateDir(path: string): boolean {
  if (!containsInlineScript(path)) return;

  const html = read.call(this, path, '.inline-script');
  const css = read.call(this, path, '.css');
  const js = read.call(this, path, '.js');

  const joinedHtml = joinInlineScript(html, css, js);

  this.addFileEvent(Path.join(path, 'index.html'), joinedHtml);
}

plugin.updateDir = function (path: string): boolean {
  return updateDir.call(this, path);
};

plugin.addFileEvent = function (path: string, fileContent: string): boolean {
  if (isInlineScriptFile(path)) {
    this.fs.write(path, fileContent);
    updateDir.call(this, Path.dirname(path));
  }

  return;
};
//#endregion

export default plugin;
