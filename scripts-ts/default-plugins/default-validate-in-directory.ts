const fs = require('fs-extra');

import Dev from '../Dev';
import DunyaPlugin from '../DunyaPlugin';
import IDevArgs from '../IDevArgs';

let plugin: DunyaPlugin = {
  name: '',
};

plugin.name = 'default-validate-in-directory';
plugin.validate = async function (dev: Dev) {
  if (!fs.existsSync(dev.args.in)) fs.mkdirsSync(dev.args.in);
};

export default plugin;
