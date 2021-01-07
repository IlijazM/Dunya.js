/**
 * Exports an interface that contains the default arguments of a pipe.
 *
 * @packageDocumentation
 */

/**
 * Contains the default arguments of a pipe.
 *
 * @author Ilijaz Mehmedovic
 *
 * @version 1.0.0
 */
interface PipeArgumentsModel {
  /**
   * If true, the PipeService script will not initiate automatically.
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
   * var filePipe = new FilePipeService(arguments);
   * filePipe.init();
   * ```
   *
   * <p>
   * Keep in mind that the init function must get called before the execute function in order for
   * the plugins to load.
   * </p>
   */
  noAutoInit?: boolean;

  /**
   * If true, the PipeService script will not execute automatically.
   *
   * <p>
   * You must then call the <var>execute</var> function programmatically.
   * </p>
   *
   * <p>
   * This could look something like this:
   * </p>
   *
   * ```javascript
   * var filePipe = new FilePipeService(arguments);
   * filePipe.execute();
   * ```
   *
   * <p>
   * Keep in mind that the init function must get called before the execute function in order for
   * the plugins to load.
   * </p>
   */
  noAutoExecute?: boolean;

  /**
   * An array that includes all plugin paths of the pipeline.
   *
   * <p>
   * Install a plugin using ``npm i dunya-plugin`` and use the package name as the plugin name
   * to include it.
   * </p>
   *
   * <p>
   * A plugin path starts with a tilde ('~') when its path is relative to the workspace you're
   * currently working with.
   * </p>
   */
  plugins?: Array<string>;

  /**
   * The path to the input directory.
   */
  inputDirectory: string;

  /**
   * The path to the output directory.
   */
  outputDirectory: string;
}

// Export default.
export default PipeArgumentsModel;
