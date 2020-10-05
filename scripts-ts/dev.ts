const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');

import IArgs from './IDevArgs';

import argumentHandler from './argumentHandler.js';
import * as common from './common.js';

export default class dev {
  private args: IArgs = {
    config: 'dunya.config.json',

    ip: '0.0.0.0',
    port: 8080,

    in: 'src',
    out: 'string',

    props: {},
  };

  private configArgs: IArgs;

  private getConfigPath(): string {
    return this.userArgs.config ?? this.args.config;
  }

  private configProvider(): void {
    const configPath = this.getConfigPath();
    this.configArgs = common.loadAndParseJSONSafe(configPath) as IArgs;
  }

  private argumentProvider(): void {
    argumentHandler(this.args, this.configArgs, this.userArgs);
  }

  constructor(private dirName: string, private userArgs: IArgs) {
    this.argumentProvider();
  }
}
