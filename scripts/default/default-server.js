"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let server = {};
const liveServer = require('live-server');
server.onStart = function (args) {
    const params = {
        port: args.port,
        host: args.ip,
        root: args.dir,
        open: false,
        ...args,
    };
    liveServer.start(params);
};
server.onStop = function () { };
exports.default = server;
