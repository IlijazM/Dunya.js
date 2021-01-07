/**
 * Exports an extended the plugin interface that is used as for file pipe plugins.
 *
 * @packageDocumentation
 */

import EFileEvents from '../enum/EFileEvents';
import PluginModel from '../../pipe/plugin/PipePluginModel';
import FilePipeArgumentsModel from '../model/FilePipeArgumentsModel';
import FilePathAndContentModel from '../../model/FilePathAndContentModel';

/**
 * Contains the model of a plugin for the file pipe.
 *
 * @author Ilijaz Mehmedovic
 *
 * @version 0.5.0
 */
interface FilePipePluginModel extends PluginModel {
  /**
   * Gets called when the plugin got successfully loaded from the FilePipeService class.
   *
   * @param pFilePipeArgumentsModel a reference to the arguments of the FilePipeService.
   */
  filePipeInit?: (pFilePipeArgumentsModel: FilePipeArgumentsModel) => {};

  /**
   * Gets called before the callEvent function gets called.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * @param pEvent the event of the file (e.g. add, change, ...).
   * @param pFilePath the relative path from the workspace to the file.
   * @return true, when the calling of functions from upcoming plugins should get interrupted.
   */
  callEvent?: (pEvent: EFileEvents, pFilePath: string) => boolean;

  /**
   * Gets called before the callEvent function gets called.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pEvent the event of the file (e.g. add, change, ...).
   * @param pFilePath the relative path from the workspace to the file.
   */
  callEventEnsured?: (pEvent: EFileEvents, pFilePath: string) => boolean;

  /**
   * Gets called before the event gets handled by the corresponding event functions.
   *
   * <p>
   * Keep in mind that the event of the file could be 'unlink' which means that the content of the
   * file is not available.
   * </p>
   *
   * <p>
   * This function is a pipe which means that when there are two different plugins that overwrites
   * the same function, both functions get called with the pipe as the argument. Both functions may
   * manipulate the pipe parameter in the same order as their priorities. At the end, the
   * manipulated pipe value will get returned.
   * </p>
   *
   * <p>
   * If this function returns ``undefined`` the value of the pipe arguments stays the same.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @param pEvent the file event.
   * @return the manipulated pipe or ``undefined``.
   */
  callEventPipe?: (pPipe: FilePathAndContentModel, pEvent: EFileEvents) => FilePathAndContentModel;

  /**
   * Gets called after the callEvent function gets called.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * @param pEvent the event of the file (e.g. add, change, ...).
   * @param pFilePath the relative path from the workspace to the file.
   * @return true, when the calling of functions from upcoming plugins should get interrupted.
   */
  callEventAfter?: (pEvent: EFileEvents, pFilePath: string) => boolean;

  /**
   * Gets called after the callEvent function gets called.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pEvent the event of the file (e.g. add, change, ...).
   * @param pFilePath the relative path from the workspace to the file.
   */
  callEventEnsuredAfter?: (pEvent: EFileEvents, pFilePath: string) => boolean;

  /**
   * Gets called when the addEvent function gets called.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   * @return true, when the calling of functions from upcoming plugins should get interrupted.
   */
  addEvent?: (pFileModel: FilePathAndContentModel) => boolean;

  /**
   * Gets called when the addEvent function gets called.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   * @param pFilePath the relative path from the workspace to the file.
   */
  addEventEnsured?: (pFileModel: FilePathAndContentModel) => void;

  /**
   * Gets called before the addEvent gets handled by the corresponding plugins.
   *
   * <p>
   * This function is a pipe which means that when there are two different plugins that overwrites
   * the same function, both functions get called with the pipe as the argument. Both functions may
   * manipulate the pipe parameter in the same order as their priorities. At the end, the
   * manipulated pipe value will get returned.
   * </p>
   *
   * <p>
   * If this function returns ``undefined`` the value of the pipe arguments stays the same.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @return the manipulated pipe or ``undefined``.
   */
  addEventPipe?: (pPipe: FilePathAndContentModel) => FilePathAndContentModel;

  /**
   * Gets called after the addEvent function gets called.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @return true, when the calling of functions from upcoming plugins should get interrupted.
   */
  addEventAfter?: (pPipe: FilePathAndContentModel) => boolean;

  /**
   * Gets called after the addEvent function gets called.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @param pFilePath the relative path from the workspace to the file.
   */
  addEventEnsuredAfter?: (pPipe: FilePathAndContentModel) => void;

  /**
   * Gets called when the changeEvent function gets called.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   * @return true, when the calling of functions from upcoming plugins should get interrupted.
   */
  changeEvent?: (pFileModel: FilePathAndContentModel) => boolean;

  /**
   * Gets called when the changeEvent function gets called.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   * @param pFilePath the relative path from the workspace to the file.
   */
  changeEventEnsured?: (pFileModel: FilePathAndContentModel) => void;

  /**
   * Gets called before the changeEvent gets handled by the corresponding plugins.
   *
   * <p>
   * This function is a pipe which means that when there are two different plugins that overwrites
   * the same function, both functions get called with the pipe as the argument. Both functions may
   * manipulate the pipe parameter in the same order as their priorities. At the end, the
   * manipulated pipe value will get returned.
   * </p>
   *
   * <p>
   * If this function returns ``undefined`` the value of the pipe arguments stays the same.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @return the manipulated pipe or ``undefined``.
   */
  changeEventPipe?: (pPipe: FilePathAndContentModel) => FilePathAndContentModel;

  /**
   * Gets called after the changeEvent function gets called.
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @return true, when the calling of functions from upcoming plugins should get interrupted.
   */
  changeEventAfter?: (pPipe: FilePathAndContentModel) => boolean;

  /**
   * Gets called after the changeEvent function gets called.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @param pFilePath the relative path from the workspace to the file.
   */
  changeEventEnsuredAfter?: (pPipe: FilePathAndContentModel) => void;

  /**
   * Gets called when the unlinkEvent function gets called.
   *
   * <p>
   * Keep in mind that the content of the file is not available.
   * </p>
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   * @return true, when the calling of functions from upcoming plugins should get interrupted.
   */
  unlinkEvent?: (pFileModel: FilePathAndContentModel) => boolean;

  /**
   * Gets called when the unlinkEvent function gets called.
   *
   * <p>
   * Keep in mind that the content of the file is not available.
   * </p>
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   * @param pFilePath the relative path from the workspace to the file.
   */
  unlinkEventEnsured?: (pFileModel: FilePathAndContentModel) => void;

  /**
   * Gets called before the unlinkEvent gets handled by the corresponding plugins.
   *
   * <p>
   * Keep in mind that the content of the file is not available.
   * </p>
   *
   * <p>
   * This function is a pipe which means that when there are two different plugins that overwrites
   * the same function, both functions get called with the pipe as the argument. Both functions may
   * manipulate the pipe parameter in the same order as their priorities. At the end, the
   * manipulated pipe value will get returned.
   * </p>
   *
   * <p>
   * If this function returns ``undefined`` the value of the pipe arguments stays the same.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @return the manipulated pipe or ``undefined``.
   */
  unlinkEventPipe?: (pPipe: FilePathAndContentModel) => FilePathAndContentModel;

  /**
   * Gets called after the unlinkEvent function gets called.
   *
   * <p>
   * Keep in mind that the content of the file is not available.
   * </p>
   *
   * <p>
   * If this function returns a falsy value, a function from a plugin with a lower priority will
   * get called as well. Return a truthy value in order to stop the execution of another function
   * form a plugin with a lower priority.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @return true, when the calling of functions from upcoming plugins should get interrupted.
   */
  unlinkEventAfter?: (pPipe: FilePathAndContentModel) => boolean;

  /**
   * Gets called after the unlinkEvent function gets called.
   *
   * <p>
   * Keep in mind that the content of the file is not available.
   * </p>
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @param pFilePath the relative path from the workspace to the file.
   */
  unlinkEventEnsuredAfter?: (pPipe: FilePathAndContentModel) => void;
}

// Export default
export default FilePipePluginModel;
