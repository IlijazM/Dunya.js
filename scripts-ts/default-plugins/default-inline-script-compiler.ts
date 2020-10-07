const fs = require('fs-extra');
const path = require('path-extra');
const glob = require('glob');

import { dir } from 'console';
import { dirname } from 'path';
import Dev from '../Dev';
import DunyaPlugin from '../DunyaPlugin';

function generateHTML(html: string, style: string, script: string): string {
  return `${html}

<style scoped>
${style}
</style>

<script>
${script}
</script>`;
}

async function addTemplate(dev: Dev, dirName: string): Promise<void> {
  try {
    await fs.writeFile(
      path.join(dev.args.out, dirName, 'index.html'),
      await dev['getTemplate']()
    );
  } catch (err) {
    console.error(err);
  }
}

async function addHtml(dev: Dev, dirName: string, html: string): Promise<void> {
  await fs.writeFile(path.join(dev.args.out, dirName, dirName + '.html'), html);
}

function findFile(dev: Dev, dirName: string, ext: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const inDirName = path.join(dev.args.in, dirName);

    glob(path.join(inDirName, '*'), async (err, files) => {
      for (let filePath of files) {
        let fileContent = await fs.readFile(filePath);
        fileContent = fileContent.toString();

        const res = await dev.pluginPipe(
          'pipeFile',
          { filePath, fileContent },
          dev.args,
          false
        );

        filePath = res.filePath ?? filePath;
        fileContent = res.fileContent ?? fileContent;

        if (path.basename(filePath) === dirName + ext) resolve(fileContent);
      }

      resolve('');
    });
  });
}

function getStyle(dev: Dev, dirName: string): Promise<string> {
  return findFile(dev, dirName, '.css');
}

function getScript(dev: Dev, dirName: string): Promise<string> {
  return findFile(dev, dirName, '.js');
}

function getHTML(dev: Dev, dirName: string): Promise<string> {
  return findFile(dev, dirName, '.inline-script');
}

let plugin: DunyaPlugin = {
  name: '',
};

plugin.name = 'default-inline-script-compiler';
plugin.beforeWatchEventHalter = async function (
  dev: Dev,
  event: string,
  filePath: string
): Promise<boolean> {
  const ext = path.extname(filePath);
  if (ext !== '.inline-script') return false;

  const dirName = path.dirname(filePath);
  if (dirName !== path.base(filePath)) return false;

  const style = await getStyle(dev, dirName);
  const script = await getScript(dev, dirName);
  const html = await getHTML(dev, dirName);

  await addTemplate(dev, dirName);
  await addHtml(dev, dirName, generateHTML(html, style, script));

  return true;
};

export default plugin;
