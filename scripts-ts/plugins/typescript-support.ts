import DunyaPlugin from '../DunyaPlugin';
import { IOPaths } from '../Types';

const Path = require('path-extra');
const tsc = require('typescript-compiler');

function filterExtensionName(path: string): boolean {
  return Path.extname(path) !== '.ts';
}

function compileTypescript(fileContent: string): string {
  console.log('Compile typescript:');
  console.log(this.args.typeScriptConfig);
  return tsc.compileString(fileContent, this.args.typeScriptConfig.split(' '));
}

function compile(path: string, fileContent: string): string {
  try {
    return compileTypescript.call(this, fileContent);
  } catch (err) {
    console.error(`An error occurred while compiling '${path}':\n${err}`);
    return err.toString();
  }
}

function convertPath(path: string): string {
  return Path.join(Path.dirname(path), Path.base(path) + '.js');
}

const plugin: DunyaPlugin = {
  name: 'typescript-support',
  priority: 300,
};

plugin.filePipe = function (pipe: { path: string; fileContent: string }): { path: string; fileContent: string } {
  if (filterExtensionName(pipe.path)) return;

  pipe.fileContent = compile.call(this, pipe.path, pipe.fileContent);
  pipe.path = convertPath(pipe.path);

  return pipe;
};

plugin.deleteEventPipe = function (pipe: IOPaths): IOPaths {
  if (filterExtensionName(pipe.outputPath)) return;
  pipe.outputPath = convertPath(pipe.outputPath);
  return pipe;
};

plugin.setup = function () {
  console.log(__dirname);
  this.args.typeScriptConfig = this.args.typeScriptConfig || '--module commonjs -t ESNEXT';
};

export default plugin;
