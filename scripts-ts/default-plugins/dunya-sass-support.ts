const fs = require('fs-extra');
const path = require('path');

import DunyaPlugin from '../DunyaPlugin';
import IDevArgs from '../IDevArgs';

const sass = require('sass');
async function compileScss(code: string): Promise<string> {
  return sass
    .renderSync({
      data: code,
    })
    .css.toString();
}

let plugin: DunyaPlugin = {
  name: '',
};

plugin.name = 'dunya-sass-support';

plugin.pipeFile = async function (
  args: IDevArgs,
  { filePath, fileContent }: { filePath: string; fileContent: string },
  onDelete: boolean
) {
  const ext = path.extname(filePath);

  if (ext !== 'scss') return undefined;

  const endIndex = filePath.length - path.extname(filePath).length;
  filePath = filePath.substr(0, endIndex) + '.css';

  if (onDelete) return { filePath };

  fileContent = await compileScss(fileContent);

  return { filePath, fileContent };
};

export default plugin;
