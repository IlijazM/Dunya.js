import Args from './Args';
import Pipe from './Pipe';

export default class Chain {
  pipes: Array<Pipe> = [];

  constructPipe(pipeName: string) {
    const pipe = new Pipe(pipeName, this.args);
    this.pipes.push(pipe);
  }

  constructAll() {
    this.pipeNames.forEach((pipeName) => this.constructPipe(pipeName));
  }

  constructor(private pipeNames: Array<string>, private args: Args) {
    this.constructAll();
  }

  initAll() {
    this.pipes.forEach((pipe) => pipe.init());
  }

  terminateAll() {
    this.pipes.forEach((pipe) => pipe.terminate());
    this.pipes = [];
  }
}
