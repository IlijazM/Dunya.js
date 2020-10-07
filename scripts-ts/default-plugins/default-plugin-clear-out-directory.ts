const fs = require('fs-extra');
const path = require('path');

import DunyaPlugin from '../DunyaPlugin';
import IDevArgs from '../IDevArgs';

let plugin: DunyaPlugin = {
  name: '',
};

plugin.name = 'default-plugin-clear-out-directory';
plugin.validate = async function (args: IDevArgs) {
  const pathName = path.join(args.modulePath, args.out);
  await fs.emptyDir(pathName); // This will also create a new directory if needed.
};

export default plugin;
