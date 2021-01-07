/**
 * Exports an extended service that loads and executes file pipe plugins.
 *
 * @packageDocumentation
 */

import EFileEvents from '../enum/EFileEvents';
import PluginService from '../../pipe/plugin/PipePluginService';
import FilePipeArgumentsModel from '../model/FilePipeArgumentsModel';
import FilePathAndContentModel from '../../model/FilePathAndContentModel';

/**
 * The service that loads and executes plugins.
 *
 * <p>
 * It extends the PluginService.
 * </p>
 *
 * @author Ilijaz Mehmedovic
 *
 * @version 0.5.0
 */
class FilePipePluginService extends PluginService {
  /**
   * Should get called when the plugin got successfully loaded from the FilePipeService class.
   *
   * @param pFilePipeArgumentsModel a reference to the arguments of the FilePipeService.
   */
  filePipeInit(pFilePipeArgumentsModel: FilePipeArgumentsModel) {
    this.pluginCallAll('filePipeInit', pFilePipeArgumentsModel);
  }

  /**
   * Should get called before the callEvent function gets called.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pEvent the event of the file (e.g. add, change, ...).
   * @param pFilePath the relative path from the workspace to the file.
   */
  callEvent(pEvent: EFileEvents, pFilePath: string) {
    this.pluginCaller('callEvent', pEvent, pFilePath);
  }

  /**
   * Should get called before the callEvent function gets called.
   *
   * <p>
   * Ensured means, that every functions will definitely get executed.
   * </p>
   *
   * @param pEvent the event of the file (e.g. add, change, ...).
   * @param pFilePath the relative path from the workspace to the file.
   */
  callEventEnsured(pEvent: EFileEvents, pFilePath: string) {
    this.pluginCaller('callEventEnsured', pEvent, pFilePath);
  }

  /**
   * Should get called after the callEvent function gets called.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pEvent the event of the file (e.g. add, change, ...).
   * @param pFilePath the relative path from the workspace to the file.
   */
  callEventAfter(pEvent: EFileEvents, pFilePath: string) {
    this.pluginCaller('callEvent', pEvent, pFilePath);
  }

  /**
   * Should get called after the callEvent function gets called.
   *
   * <p>
   * Ensured means, that every functions will definitely get executed.
   * </p>
   *
   * @param pEvent the event of the file (e.g. add, change, ...).
   * @param pFilePath the relative path from the workspace to the file.
   */
  callEventEnsuredAfter(pEvent: EFileEvents, pFilePath: string) {
    this.pluginCaller('callEventEnsured', pEvent, pFilePath);
  }

  /**
   * Should get called before the event gets handled by the corresponding event functions.
   *
   * <p>
   * Keep in mind that the event of the file could be 'unlink' which means that the content of the
   * file is not available.
   * </p>
   *
   * <p>
   * This function calls a pipe which means that when there are two different plugins that
   * overwrites the same function, both functions get called with the pipe as the argument. Both
   * functions may manipulate the pipe parameter in the same order as their priorities. At the end,
   * the manipulated pipe value will get returned.
   * </p>
   *
   * <p>
   * If a function returns ``undefined`` the value of the pipe arguments stays the same.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @param pEvent the file event.
   * @return the manipulated pipe or ``undefined``.
   */
  callEventPipe(pPipe: FilePathAndContentModel, pEvent: EFileEvents): FilePathAndContentModel {
    return this.pluginPipe('callEventPipe', pPipe, pEvent);
  }

  /**
   * Should get called when the addEvent function gets called.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   */
  addEvent(pFileModel: FilePathAndContentModel): void {
    this.pluginCaller('addEvent', pFileModel);
  }

  /**
   * Should get called when the addEvent function gets called.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   * @param pFilePath the relative path from the workspace to the file.
   */
  addEventEnsured(pFileModel: FilePathAndContentModel): void {
    this.pluginCallAll('addEventEnsured', pFileModel);
  }

  /**
   * Should get called before the addEvent gets handled by the corresponding plugins.
   *
   * <p>
   * This function calls a pipe which means that when there are two different plugins that
   * overwrites the same function, both functions get called with the pipe as the argument. Both
   * functions may manipulate the pipe parameter in the same order as their priorities. At the end,
   * the manipulated pipe value will get returned.
   * </p>
   *
   * <p>
   * If this function returns ``undefined`` the value of the pipe arguments stays the same.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @return the manipulated pipe or ``undefined``.
   */
  addEventPipe(pPipe: FilePathAndContentModel): FilePathAndContentModel {
    return this.pluginPipe('addEventPipe', pPipe);
  }

  /**
   * Should get called after the addEvent function gets called.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pPipe the path and content of a file.
   */
  addEventAfter(pPipe: FilePathAndContentModel): void {
    this.pluginCaller('addEventAfter', pPipe);
  }

  /**
   * Should get called after the addEvent function gets called.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @param pFilePath the relative path from the workspace to the file.
   */
  addEventEnsuredAfter(pPipe: FilePathAndContentModel): void {
    this.pluginCallAll('addEventEnsuredAfter', pPipe);
  }

  /**
   * Should get called when the changeEvent function gets called.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   */
  changeEvent(pFileModel: FilePathAndContentModel): void {
    this.pluginCaller('changeEvent', pFileModel);
  }

  /**
   * Should get called when the changeEvent function gets called.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   * @param pFilePath the relative path from the workspace to the file.
   */
  changeEventEnsured(pFileModel: FilePathAndContentModel): void {
    this.pluginCallAll('changeEventEnsured', pFileModel);
  }

  /**
   * Should get called before the changeEvent gets handled by the corresponding plugins.
   *
   * <p>
   * This function calls a pipe which means that when there are two different plugins that
   * overwrites the same function, both functions get called with the pipe as the argument. Both
   * functions may manipulate the pipe parameter in the same order as their priorities. At the end,
   * the manipulated pipe value will get returned.
   * </p>
   *
   * <p>
   * If this function returns ``undefined`` the value of the pipe arguments stays the same.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @return the manipulated pipe or ``undefined``.
   */
  changeEventPipe(pPipe: FilePathAndContentModel): FilePathAndContentModel {
    return this.pluginPipe('changeEventPipe', pPipe);
  }

  /**
   * Should get called after the changeEvent function gets called.
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pPipe the path and content of a file.
   */
  changeEventAfter(pPipe: FilePathAndContentModel): void {
    this.pluginCaller('changeEventAfter', pPipe);
  }

  /**
   * Should get called after the changeEvent function gets called.
   *
   * <p>
   * Ensured means, that this functions will definitely get executed.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @param pFilePath the relative path from the workspace to the file.
   */
  changeEventEnsuredAfter(pPipe: FilePathAndContentModel): void {
    this.pluginCallAll('changeEventEnsuredAfter', pPipe);
  }

  /**
   * Should get called when the unlinkEvent function gets called.
   *
   * <p>
   * Keep in mind that the content of the file is not available.
   * </p>
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   */
  unlinkEvent(pFileModel: FilePathAndContentModel): void {
    this.pluginCaller('unlinkEvent', pFileModel);
  }

  /**
   * Should get called when the unlinkEvent function gets called.
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
  unlinkEventEnsured(pFileModel: FilePathAndContentModel): void {
    this.pluginCallAll('unlinkEventEnsured', pFileModel);
  }

  /**
   * Should get called before the unlinkEvent gets handled by the corresponding plugins.
   *
   * <p>
   * Keep in mind that the content of the file is not available.
   * </p>
   *
   * <p>
   * This function calls a pipe which means that when there are two different plugins that
   * overwrites the same function, both functions get called with the pipe as the argument. Both
   * functions may manipulate the pipe parameter in the same order as their priorities. At the end,
   * the manipulated pipe value will get returned.
   * </p>
   *
   * <p>
   * If this function returns ``undefined`` the value of the pipe arguments stays the same.
   * </p>
   *
   * @param pPipe the path and content of a file.
   * @return the manipulated pipe or ``undefined``.
   */
  unlinkEventPipe(pPipe: FilePathAndContentModel): FilePathAndContentModel {
    return this.pluginPipe('unlinkEventPipe', pPipe);
  }

  /**
   * Should get called after the unlinkEvent function gets called.
   *
   * <p>
   * Keep in mind that the content of the file is not available.
   * </p>
   *
   * <p>
   * If a function returns a falsy value, a function from a plugin with a lower priority will get
   * called as well. Return a truthy value in order to stop the execution of another function form
   * a plugin with a lower priority.
   * </p>
   *
   * @param pPipe the path and content of a file.
   */
  unlinkEventAfter(pPipe: FilePathAndContentModel): void {
    this.pluginCaller('unlinkEventAfter', pPipe);
  }

  /**
   * Should get called after the unlinkEvent function gets called.
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
  unlinkEventEnsuredAfter(pPipe: FilePathAndContentModel): void {
    this.pluginCallAll('unlinkEventEnsuredAfter', pPipe);
  }
}

// Export default.
export default FilePipePluginService;
