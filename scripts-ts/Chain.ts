/**
 * Exports the chain class that could be used to serve multiple pipes.
 *
 * @packageDocumentation
 */

import Args from './Args';
import Pipe from './Pipe';

/**
 * A chain servers multiple pipes.
 */
export default class Chain {
  /**
   * A object of all pipes the chain will serve.
   *
   * <p>
   * The key value is the pipe name and the value is a reference to the pipe object.
   * </p>
   *
   * <p>
   * It defaults to an empty array.
   * </p>
   */
  private pipes: Record<string, Pipe> = {};

  /**
   * Construct all pipes.
   *
   * @param pipeNames an array of all pipe names that will get constructed.
   *
   * <p>
   * The pipe name is the key value of the pipe that got defined in the dunya config file.
   * </p>
   *
   * <p>
   * If a pipe name doesn't exist, it will get ignored and an error message will get printed into
   * the console.
   * </p>
   *
   * @param args the arguments of all pipes.
   *
   * <p>
   * These arguments will overwrite the default arguments as well as the arguments that got defined
   * with the pipe in the dunya config file.
   * </p>
   */
  constructor(private pipeNames: Array<string>, private args: Args) {
    this.constructAll();
  }

  /**
   * Creates a new instance of the pipe with the pipe name.
   *
   * @param pipeName the pipe name.
   */
  constructPipe(pipeName: string) {
    const pipe = new Pipe(pipeName, this.args);
    this.pipes[pipeName] = pipe;
  }

  /**
   * Constructs all pipes that got passed in the constructor.
   */
  constructAll() {
    this.pipeNames.forEach((pipeName) => this.constructPipe(pipeName));
  }

  /**
   * Calls the ``init`` function on all pipes.
   */
  initAll() {
    Object.entries(this.pipes).forEach(([key, value]) => {
      value.init();
    });
  }

  /**
   * Calls the ``terminate`` function on all pipes and then resets the variable ``pipes``.
   */
  terminateAll() {
    Object.entries(this.pipes).forEach(([key, value]) => {
      value.terminate();
    });

    this.pipes = {};
  }
}
