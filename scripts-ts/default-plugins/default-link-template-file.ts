const fs = require('fs-extra');
const path = require('path');

import Dev from '../Dev';
import DunyaPlugin from '../DunyaPlugin';
import IDevArgs from '../IDevArgs';

let plugin: DunyaPlugin = {
  name: '',
};

plugin.name = 'default-link-template-file';
plugin.setup = async function (dev: Dev) {
  dev['getTemplate'] = async function () {
    const pathName = path.join(this.args.in, 'template.html');
    if (!fs.existsSync(pathName)) throw new Error(`Missing '${pathName}'.`);
    return (await fs.readFile(pathName)).toString();
  };
};

export default plugin;
