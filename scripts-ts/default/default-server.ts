import DunyaServer from '../DunyaServer';
import DunyaServerArgs from '../DunyaServerArgs';

let server: DunyaServer = {};

const liveServer = require('live-server');

server.onStart = function (args: DunyaServerArgs): void {
  const params = {
    port: args.port,
    host: args.ip,
    root: args.dir,
    open: false,
    ...args,
  };

  liveServer.start(params);
};

server.onStop = function (): void {};

export default server;
