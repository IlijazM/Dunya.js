'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const glob = require('glob');
const fs = require('fs-extra');
const path = require('path-extra');
async function compileHtml(dev, event, filePath) {
  const dirName = filePath.substr(
    0,
    filePath.length - path.extname(filePath).length
  );
  if (event === 'unlink') {
    await fs.remove(path.join(dev.args.out, dirName));
    return true;
  }
  await fs.mkdirs(path.join(dev.args.out, dirName), (err) => {});
  const htmlFile = path.basename(filePath);
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
  const to = path.join(dev.args.out, dirName, path.basename(dirName)) + '.html';
  console.log(from + ' -> ' + to);
  await fs.copyFile(from, to);
  return true;
}
async function compileTemplate(dev, event, filePath) {
  glob(path.join(dev.args.out, '**/index.html'), (err, files) => {
    files.forEach(async (file) => {
      file = file.substr(dev.args.out.length + 1);
      const dirName = path.dirname(file);
      const basename = path.basename(dirName);
      const pathName = path.join(dirName, basename + '.html');
      const htmlFile = path.basename(filePath);
      let relativePath = dirName
        .split(/[\\\/]/gm)
        .map((_) => '..')
        .join('/');
      if (!fs.existsSync(path.join(dev.args.out, pathName))) return;
      await fs.writeFile(
        path.join(dev.args.out, file),
        await dev['getTemplate'](relativePath, htmlFile)
      );
    });
  });
  return false;
}
let plugin = {
  name: '',
};
plugin.name = 'default-html-compiler';
plugin.beforeWatchEventHalter = async function (dev, event, filePath) {
  const ext = path.extname(filePath);
  if (ext !== '.html') return false;
  if (path.basename(filePath) === 'template.html')
    return compileTemplate(dev, event, filePath);
  return compileHtml(dev, event, filePath);
};
exports.default = plugin;
