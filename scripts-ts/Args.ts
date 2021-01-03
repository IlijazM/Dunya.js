/**
 * Exports an interface that contains the default arguments of a pipe.
 *
 * @packageDocumentation
 */

/**
 * Contains the default arguments of a pipe.
 *
 * <p>
 * This interface also allows defining new parameters that could be used e.g. in custom plugins.
 * </p>
 */
interface Args {
  /**
   * The path to the dunya config file.
   *
   * <p>
   * The default path is 'dunya.config.json'
   * </p>
   */
  config?: string;

  /**
   * If true the dev script will not initiate automatically.
   *
   * <p>
   * You must then call the <var>init</var> function programmatically.
   * </p>
   *
   * <p>
   * This could look something like this:
   * </p>
   *
   * ```javascript
   * var pipe = new Pipe(pipeName, config);
   * pipe.init();
   * ```
   *
   * <p>
   * Or using a chain:
   * </p>
   *
   * ```javascript
   * var chain = new Chain(pipes, config);
   * chain.initAll();
   * ```
   */
  noAutoInit?: boolean;

  /**
   * If true it turns off the default watcher.
   */
  noWatcher?: boolean;

  /**
   * If true it turns off the default server.
   */
  noServer?: boolean;

  /**
   * An array that includes all plugin paths.
   *
   * <p>
   * Install a plugin using ``npm i dunya-plugin`` nd use the package name as the plugin name
   * to include it.
   * </p>
   *
   * <p>
   * A plugin path starts with a tilde ('~') when its path is relative to the workspace you're
   * currently working with.
   * </p>
   *
   * <p>
   * A plugin path start with hash ('#') when it's a default plugin provided by dunya.js. Keep in
   * mind that this may get deprecated.
   * </p>
   */
  plugins?: Array<string>; // A array of all plugin names

  /**
   * The ip address of the server.
   */
  ip: string;

  /**
   * The port of the server.
   */
  port: number;

  /**
   * The path to the input directory that will get watched.
   */
  inputDir: string;

  /**
   * The path to the output directory.
   */
  outputDir: string;

  /**
   * Allows for custom arguments.
   */
  [key: string]: any;
}

export default Args;
