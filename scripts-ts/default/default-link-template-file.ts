const fs = require('fs-extra');
const path = require('path');

import Dev from '../Dev';
import DunyaPlugin from '../DunyaPlugin';
import IDevArgs from '../IDevArgs';

function compileTemplate(
  template: string,
  relativePath: string,
  htmlFile: string,
  args: IDevArgs
): string {
  const props = args.props;

  template = template.replace(/\"\~\//gm, '"' + relativePath + '/');

  const regex = /\*\{\{(.*?)\}\}/gm;

  let m;

  while ((m = regex.exec(template)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    const match = m[0];
    const index = m.index;

    let res = eval(match.substr(1));
    if (res === undefined) {
      res = '';
    }
    if (typeof res === 'object') res = JSON.stringify(res);

    template =
      template.substring(0, index) +
      res.toString() +
      template.substr(index + match.length);
    regex.lastIndex += res.toString().length;
  }

  return template;
}

let plugin: DunyaPlugin = {
  name: '',
};

plugin.name = 'default-link-template-file';
plugin.setup = async function (dev: Dev) {
  dev['getTemplate'] = async function (
    relativePath: string,
    htmlFile: string
  ): Promise<string> {
    const pathName = path.join(this.args.in, 'template.html');
    if (!fs.existsSync(pathName)) throw new Error(`Missing '${pathName}'.`);
    let template = (await fs.readFile(pathName)).toString();
    return compileTemplate(template, relativePath, htmlFile, dev.args);
  };
};

export default plugin;
