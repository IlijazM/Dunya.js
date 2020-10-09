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
  let dirName = filePath.substr(
    0,
    filePath.length - path.extname(filePath).length
  );

  if (event === 'unlink') {
    await fs.remove(path.join(dev.args.out, dirName));
    return true;
  }

  let htmlFile = path.basename(filePath);

  if (htmlFile === 'index.html') {
    htmlFile = '_index.html';
    dirName = dirName.substr(0, dirName.length - '/index'.length);
    console.log(htmlFile, dirName);
  }

  await fs.mkdirs(path.join(dev.args.out, dirName), (err) => {});

  let relativePath = dirName
    .split(/[\\\/]/gm)
    .map((_) => '..')
    .join('/');

  try {
    await fs.writeFile(
      path.join(dev.args.out, dirName, 'index.html'),
      await dev['getTemplate'](relativePath, htmlFile)
    );
  } catch (err) {
    console.error(err);
  }

  const from = path.join(dev.args.in, filePath);
  const to = path.join(dev.args.out, dirName, htmlFile);
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
      file = file.substr(dev.args.out.length + 1);
      let dirName = path.dirname(file);
      const basename = path.basename(dirName);
      const pathName = path.join(dirName, basename + '.html');

      let htmlFile = path.basename(pathName);
      if (htmlFile === '..html') htmlFile = '_index.html';
      let relativePath = dirName
        .split(/[\\\/]/gm)
        .map((_) => '..')
        .join('/');

      await fs.writeFile(
        path.join(dev.args.out, file),
        await dev['getTemplate'](relativePath, htmlFile)
      );
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
