const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');

import IArgs from './interfaces/devArgs';
import IDevArgs from './IDevArgs';
import IConfig from './interfaces/config';

import argumentHandler from './argumentHandler.js';
import { Server } from 'http';

//#region arguments
function getDefaultArgs(dirname: string): IDevArgs {
  return {
    ip: '0.0.0.0',
    port: 8080,

    in: 'src',
    out: dirname + '/dev',

    props: {},
  };
}

async function loadArgs(dirname: string, userArgs: IArgs): Promise<IDevArgs> {
  let args = getDefaultArgs(dirname);

  const config = await loadConfig(userArgs.config);

  argumentHandler(args, config, userArgs);

  return args;
}

async function loadConfig(path): Promise<IConfig> {
  path = path ?? 'dunya.config.json';

  if (!fs.existsSync(path)) throw new Error(`Missing '${path}'.`);

  const config = await fs.readFile(path);

  try {
    return JSON.parse(config.toString());
  } catch (err) {
    throw new SyntaxError(`An error occurred while parsing '${path}':\n${err}`);
  }
}
//#endregion

function validateFiles(args: IDevArgs): void {
  [args.in, args.out].forEach((file) => {
    if (!fs.existsSync(file)) throw new Error(`Missing '${file}'.`);
  });
}

async function setup(args: IDevArgs): Promise<void> {
  await fs.emptyDir(args.out); // this will also automatically create a directory.
}

function watcher(args: IDevArgs): void {
  const watcher = chokidar.watch(args.in, {
    ignoreInitial: true,
  });
  watcher.on('all', eventHandler);
}

function eventHandler(event, path) {
  switch (event) {
    case 'add':
      break;
    case 'unlink':
      break;
    case 'change':
      break;
  }
}

function server(args: IDevArgs) {}

export default async function dev(
  dirname: string,
  userArgs: IArgs
): Promise<void> {
  const args = await loadArgs(dirname, userArgs);
  validateFiles(args);
  await setup(args);
  watcher(args);
}
