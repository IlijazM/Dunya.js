const fs = require('fs-extra');
const path = require('path');

import { dirname } from 'path';
import Dev from '../Dev';
import DunyaPlugin from '../DunyaPlugin';
import IDevArgs from '../IDevArgs';

let plugin: DunyaPlugin = {
  name: '',
};

plugin.name = 'default-html-compiler';
plugin.beforeWatchEventHalter = async function (
  dev: Dev,
  event: string,
  filePath: string
): Promise<boolean> {
  const ext = path.extname(filePath);
  if (ext !== '.html') return false;
  if (filePath === 'template.html') return false;

  const dirName = filePath.substr(0, filePath.length - ext.length);
  await fs.mkdirs(path.join(dev.args.out, dirName), (err) => {});

  try {
    await fs.writeFile(
      path.join(dev.args.out, dirName, 'index.html'),
      await dev['getTemplate']()
    );
  } catch (err) {
    console.error(err);
  }

  const from = path.join(dev.args.in, filePath);
  const to = path.join(dev.args.out, dirName, path.basename(dirName)) + '.html';
  console.log(from + ' -> ' + to);
  await fs.writeFile(to, 'test');
  await fs.copyFile(from, to);

  return true;
};

export default plugin;
