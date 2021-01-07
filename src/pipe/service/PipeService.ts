/**
 * Exports the service that pipes a file through a pipeline and outputs it into the output
 * directory.
 *
 * @packageDocumentation
 */

import PipeArgumentsModel from '../model/PipeArgumentsModel';
import PipePluginService from '../plugin/PipePluginService';

/**
 * The service that pipes a file throw a pipeline and outputs it into the output directory.
 *
 * @author Ilijaz Mehmedovic
 *
 * @version 0.5.0
 */
class PipeService {
  /**
   * Contains the arguments of the pipeline.
   */
  protected pipeArguments: PipeArgumentsModel;

  /**
   * The service that loads and executes plugins.
   */
  protected pluginService: PipePluginService;

  /**
   * Default constructor.
   *
   * @param pPipeArguments the arguments of the pipeline.
   */
  constructor(pPipeArguments: PipeArgumentsModel) {
    this.pipeArguments = pPipeArguments;
  }

  /**
   * A default init function.
   *
   * <p>
   * This function only serves as a placeholder until someone overwrites to init function.
   * </p>
   */
  public init() {
    // Nothing to do.
    // Is used to get overwritten.
  }

  /**
   * A default init function.
   *
   * <p>
   * This function only serves as a placeholder until someone overwrites to init function.
   * </p>
   *
   * <p>
   * The terminate function will most likely not get executed automatically.
   * </p>
   */
  public terminate() {
    // Nothing to do.
    // Is used to get overwritten.
  }

  /**
   * Calls the plugins in order to read a file.
   *
   * <p>
   * If a function returns ``undefined``, a function from a plugin with a lower priority will get
   * called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * @param pPath the path to the file.
   * @return the content of the file as string.
   */
  public fsRead(pPath: string): string {
    return this.pluginService.fsRead(pPath);
  }

  /**
   * Calls the plugins in order to write a file.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath the path to the file.
   * @param pFileContent the content of the file as string.
   */
  public fsWrite(pPath: string, pFileContent: string): void {
    this.pluginService.fsWrite(pPath, pFileContent);
  }

  /**
   * Calls the plugins in order to create directories.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pPath the path for the directory.
   */
  public fsMkdirs(pPath: string): void {
    this.pluginService.fsMkdirs(pPath);
  }

  /**
   * Calls the plugins in order to remove a file or directory.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pPath the path to the file or directory.
   */
  public fsRemove(pPath: string): void {
    this.pluginService.fsRemove(pPath);
  }

  /**
   * Calls the plugins in order to empty a directory.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pPath the path to a directory.
   * @return true, when the directory is empty.
   */
  public fsEmpty(pPath: string): void {
    this.pluginService.fsEmpty(pPath);
  }

  /**
   * Calls the plugins in order to check whether a path is a file or a directory.
   *
   * <p>
   * If a function returns ``undefined``, a function from a plugin with a lower priority will get
   * called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * @param pPath the path to a file or directory.
   * @return true, when it is a directory.
   */
  public fsIsDir(pPath: string): boolean {
    return this.pluginService.fsIsDir(pPath);
  }

  /**
   * Calls the plugins in order to check whether a path exists or not.
   *
   * <p>
   * If a function returns ``undefined``, a function from a plugin with a lower priority will get
   * called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * @param pPath the path to the file or directory.
   * @return true, when the path exists.
   */
  public fsExists(pPath: string): boolean {
    return this.pluginService.fsEmpty(pPath);
  }

  /**
   * Calls the plugins in order to read json from a file.
   *
   * <p>
   * If a function returns ``undefined``, a function from a plugin with a lower priority will get
   * called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * @param pPath the path to the json file.
   * @return a json object of the content of the file.
   */
  public fsReadJSON(pPath: string): Record<string, any> {
    return this.pluginService.fsReadJSON(pPath);
  }

  /**
   * Calls the plugins in order to join together two paths.
   *
   * <p>
   * If a function returns ``undefined``, a function from a plugin with a lower priority will get
   * called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * @param pPath1 the first path.
   * @param pPath2 the second path.
   * @return the two paths joined.
   */
  public pathJoin(pPath1: string, pPath2: string): string {
    return this.pluginService.pathJoin(pPath1, pPath2);
  }

  /**
   * Calls the plugins in order to check whether two paths are equal or not.
   *
   * <p>
   * This should especially solves the issue that different paths have different separators.
   * </p>
   *
   * <p>
   * If a function returns ``undefined``, a function from a plugin with a lower priority will get
   * called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * @param pPath a path.
   * @param pOther another path.
   * @return true, if two paths are equal.
   */
  public pathEqual(pPath: string, pOther: string): boolean {
    return this.pluginService.pathEqual(pPath, pOther);
  }

  /**
   * Joins together the path and the path of the input directory.
   *
   * @param pPath the path.
   * @return the path in the input directory.
   */
  public pathIncludeInputDirectory(pPath: string) {
    return this.pathJoin(this.pipeArguments.inputDirectory, pPath);
  }

  /**
   * Removes the input directory of a path.
   *
   * <p>
   * This function also checks if this process is even needed.
   * </p>
   *
   * @param pPath the path.
   * @return the path without the input directory.
   */
  public pathExcludeInputDirectory(pPath: string) {
    let lResultingPath = pPath;

    if (pPath.startsWith(this.pipeArguments.inputDirectory)) {
      lResultingPath = pPath.substr(this.pipeArguments.inputDirectory.length + 1);
    }

    return lResultingPath;
  }

  /**
   * Joins together the path and the path of the output directory.
   *
   * @param pPath the path.
   * @return the path in the output directory.
   */
  public pathIncludeOutputDirectory(pPath: string) {
    return this.pathJoin(this.pipeArguments.outputDirectory, pPath);
  }

  /**
   * Removes the output directory of a path.
   *
   * <p>
   * This function also checks if this process is even needed.
   * </p>
   *
   * @param pPath the path.
   * @return the path without the output directory.
   */
  public pathExcludeOutputDirectory(pPath: string) {
    let lResultingPath = pPath;

    if (pPath.startsWith(this.pipeArguments.outputDirectory)) {
      lResultingPath = pPath.substr(this.pipeArguments.outputDirectory.length + 1);
    }

    return lResultingPath;
  }
}

// Export default.
export default PipeService;
