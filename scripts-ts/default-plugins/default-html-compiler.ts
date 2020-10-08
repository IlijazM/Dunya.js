const glob = require('glob');
const fs = require('fs-extra');
const path = require('path-extra');

import Dev from '../Dev';
import DunyaPlugin from '../DunyaPlugin';

async function compileHtml(
  dev: Dev,
  event: string,
  filePath: string
): Promise<boolean> {
  const dirName = filePath.substr(
    0,
    filePath.length - path.extname(filePath).length
  );

  if (event === 'unlink') {
    await fs.remove(path.join(dev.args.out, dirName));
    return true;
  }

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
  await fs.copyFile(from, to);

  return true;
}

async function compileTemplate(
  dev: Dev,
  event: string,
  filePath: string
): Promise<boolean> {
  glob(path.join(dev.args.out, '**/index.html'), (err, files) => {
    files.forEach(async (file) => {
      const dirname = path.dirname(file);
      const basename = path.basename(dirname);
      const pathName = path.join(dirname, basename + '.html');
      if (!fs.existsSync(pathName)) return;
      await fs.writeFile(file, await dev['getTemplate']());
    });
  });

  return false;
}

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
  if (path.basename(filePath) === 'template.html')
    return compileTemplate(dev, event, filePath);

  return compileHtml(dev, event, filePath);
};

export default plugin;
