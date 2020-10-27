import DunyaPlugin from '../DunyaPlugin';
import { IOPaths } from '../Types';

const Path = require('path-extra');
const sass = require('sass');

function filterExtensionName(path: string): boolean {
  return Path.extname(path) !== '.scss';
}

function compileScss(fileContent: string): string {
  return sass.renderSync({ data: fileContent }).css.toString();
}

function compile(path: string, fileContent: string): string {
  try {
    return compileScss(fileContent);
  } catch (err) {
    console.error(`An error occurred while compiling '${path}':\n${err}`);
    return err.toString();
  }
}

function convertPath(path: string): string {
  return Path.join(Path.dirname(path), Path.base(path) + '.css');
}

const plugin: DunyaPlugin = {
  name: 'sass-support',
  priority: 300,
};

plugin.filePipe = function (pipe: { path: string; fileContent: string }): { path: string; fileContent: string } {
  if (filterExtensionName(pipe.path)) return;

  pipe.fileContent = compile(pipe.path, pipe.fileContent);
  pipe.path = convertPath(pipe.path);

  return pipe;
};

plugin.deleteEventPipe = function (pipe: IOPaths): IOPaths {
  if (filterExtensionName(pipe.outputPath)) return;
  pipe.outputPath = convertPath(pipe.outputPath);
  return pipe;
};

export default plugin;
