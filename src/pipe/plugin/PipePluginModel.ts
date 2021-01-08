/**
 * Exports the plugin interface that is used as a base for all kinds of plugins.
 *
 * @packageDocumentation
 */

/**
 * Contains a base for all kinds of plugins.
 *
 * @author Ilijaz Mehmedovic
 *
 * @version 0.9.0
 */
interface PluginModel {
  /**
   * The name of the plugin.
   *
   * <p>
   * Every plugin needs to have a unique name. If two plugins share the same name, those plugins
   * will get merged.
   * </p>
   */
  name: string;

  /**
   * The priority of the plugin.
   *
   * <p>
   * Plugins with a higher priority will get executed earlier.
   * The default priority is 0 but the priority of the default plugin is 100.
   * </p>
   *
   * <ul>
   * Norms:
   *
   * <li>
   * > 400: Only events that does not influence anything and does not stop any function
   * </li>
   *
   * <li>
   * > 300: When a file format gets converted e.g. scss -> css</li>
   * <li>
   *
   * <li>
   * > 200: When a file gets moved or edited but not the file format it self e.g. a minimizer
   * </li>
   *
   * <li>
   * < 100: When another event gets appended that does not influence the content or path of the
   * file
   * </li>
   *
   * </ul>
   */
  priority?: number;

  /**
   * Gets called when the plugin got successfully loaded.
   *
   * @param pFlags flags of the pipe service.
   */
  init?: (pFlags: Record<any, any>) => void;

  /**
   * Gets called when the script gets terminated.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * This function will not get called automatically. However, you could run it manually like
   * following:
   * </p>
   *
   * ```javascript
   * var filePipe = new FilePipeService(arguments);
   * filePipe.terminate();
   * ```
   *
   * @return true, when the calling of functions from upcoming plugins should get interrupted.
   */
  terminate?: () => boolean;

  /**
   * Gets called when the script gets terminated.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * <p>
   * This function will not get called automatically. However, you could run it manually like
   * following:
   * </p>
   *
   * ```javascript
   * var filePipe = new FilePipeService(arguments);
   * filePipe.terminate();
   * ```
   */
  terminateEnsured?: () => void;

  /**
   * Gets called when the script tries to read a file.
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param pPath the path to the file.
   * @return the content of the file as string.
   */
  fsRead?: (pPath: string) => string;

  /**
   * Gets called when the script tries to write a file.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath the path to the file.
   * @param pFileContent the content of the file as string.
   * @return return a value other than ``undefined`` if the function overwrites any other
   *         function.
   */
  fsWrite: (pPath: string, pFileContent: string) => boolean;

  /**
   * Gets called when the script tries to create directories.
   *
   * <p>
   * This function should also handle the case when the path to the directory that gets created
   * isn't provided.
   * </p>
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath the path for the directory.
   * @return return a truthy value if the function overwrites any other function.
   */
  fsMkdirs: (pPath: string) => boolean;

  /**
   * Gets called when the script tires to remove a file or directory.
   *
   * <p>
   * This function should also handle the case when the path to the directory that gets created
   * isn't provided.
   * </p>
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath the path to the file or directory.
   * @return return a truthy value if the function overwrites any other function.
   */
  fsRemove: (pPath: string) => boolean;

  /**
   * Gets called when the script tries to check whether a directory is empty or not.
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param pPath the path to a directory.
   * @return true, when the directory is empty.
   */
  fsEmpty: (pPath: string) => boolean;

  /**
   * Gets called when the script tries to check whether path leads to a directory or not.
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param pPath the path to a file or directory.
   * @return true, when it is a directory.
   */
  fsIsDir: (pPath: string) => boolean;

  /**
   * Gets called when the script tries to check whether a path exists or not.
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a value other that ``undefined``
   * </p>
   *
   * @param pPath the path to the file or directory.
   * @return true, when the path exists.
   */
  fsExists: (pPath: string) => boolean;

  /**
   * Gets called when the script tries to read a json file.
   *
   * <p>
   * This function must not ensure that the path is a json file.
   * </p>
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath the path to the json file.
   * @return a json object of the content of the file.
   */
  fsReadJSON: (pPath: string) => Record<string, any>;

  /**
   * Gets called when the script tries to join together two paths.
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath1 the first path.
   * @param pPath2 the second path.
   * @return the two paths joined.
   */
  pathJoin?: (pPath1: string, pPath2: string) => string;

  /**
   * Gets called when the script tries check if two paths are equal.
   *
   * <p>
   * This especially solves the issue that different paths have different separators.
   * </p>
   *
   * <p>
   * If this function returns ``undefined``, a function from a plugin with a lower priority will
   * get called as well. Return a value other than ``undefined`` in order to stop the execution of
   * another function form a plugin with a lower priority.
   * </p>
   *
   * <p>
   * The default plugin will set this function. In order to overwrite this function the plugin must
   * have a priority higher than 100 and must return a truthy value.
   * </p>
   *
   * @param pPath a path.
   * @param pOther another path.
   * @return true, if two paths are equal.
   */
  pathEqual?: (pPath: string, pOther: string) => boolean;
}

// Export default
export default PluginModel;
