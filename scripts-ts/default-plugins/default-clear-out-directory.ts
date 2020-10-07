const fs = require('fs-extra');
const path = require('path');

import Dev from '../Dev';
import DunyaPlugin from '../DunyaPlugin';
import IDevArgs from '../IDevArgs';

let plugin: DunyaPlugin = {
  name: '',
};

plugin.name = 'default-clear-out-directory';
plugin.validate = async function (dev: Dev) {
  const pathName = path.join(dev.args.modulePath, dev.args.out);
  await fs.mkdirs(pathName, (err) => {});
  await fs.emptyDir(pathName);
};

export default plugin;
