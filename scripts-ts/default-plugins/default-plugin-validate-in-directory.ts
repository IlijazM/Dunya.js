const fs = require('fs-extra');

import DunyaPlugin from '../DunyaPlugin';
import IDevArgs from '../IDevArgs';

let plugin: DunyaPlugin = {
  name: '',
};

plugin.name = 'default-plugin-validate-in-directory';
plugin.validate = async function (args: IDevArgs) {
  if (!fs.existsSync(args.in)) fs.mkdirSync(args.in);
};

export default plugin;
