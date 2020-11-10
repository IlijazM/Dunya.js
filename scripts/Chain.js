"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pipe_1 = require("./Pipe");
class Chain {
    constructor(pipeNames, args) {
        this.pipeNames = pipeNames;
        this.args = args;
        this.pipes = [];
        this.constructAll();
    }
    constructPipe(pipeName) {
        const pipe = new Pipe_1.default(pipeName, this.args);
        this.pipes.push(pipe);
    }
    constructAll() {
        this.pipeNames.forEach((pipeName) => this.constructPipe(pipeName));
    }
    initAll() {
        this.pipes.forEach((pipe) => pipe.init());
    }
    terminateAll() {
        this.pipes.forEach((pipe) => pipe.terminate());
        this.pipes = [];
    }
}
exports.default = Chain;
