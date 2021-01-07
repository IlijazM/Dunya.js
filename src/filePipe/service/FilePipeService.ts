/**
 * Exports the service that pipes a file through a pipeline and outputs it into the output
 * directory.
 *
 * @packageDocumentation
 */

import PipeService from '../../pipe/service/PipeService';
import EFileEvents from '../enum/EFileEvents';
import FilePipeArgumentsModel from '../model/FilePipeArgumentsModel';
import FilePipePluginService from '../plugin/FilePipePluginService';
import FilePathAndContentModel from '../../model/FilePathAndContentModel';
import PipePluginInterruptException from '../../pipe/plugin/exception/PipePluginInterruptException';

/**
 * The service that pipes a file throw a pipeline and outputs it into the output directory.
 *
 * @author Ilijaz Mehmedovic
 *
 * @version 0.5.0
 */
class FilePipeService extends PipeService {
  /**
   * Contains the arguments of the pipeline.
   */
  protected filePipeArguments: FilePipeArgumentsModel;

  /**
   * The service that loads and executes plugins.
   */
  protected pluginService: FilePipePluginService;

  /**
   * Default constructor.
   *
   * @param pFilePipeArguments the arguments of the pipeline.
   */
  constructor(pFilePipeArguments: FilePipeArgumentsModel) {
    // Call the super class.
    super(pFilePipeArguments);

    this.filePipeArguments = pFilePipeArguments;

    this.initCaller();
  }

  /**
   * Determents whether the init function should get called.
   *
   * <p>
   * This function checks, if the pipeArguments are valid and if the arguments are set so that the
   * init function can get called.
   * </p>
   *
   * @throw throws an invalid state exception when the filePipeArguments are null or undefined.
   */
  private initCaller() {
    // Throw an error when the filePipeArguments are null or undefined.
    if (this.filePipeArguments == null) {
      throw new Error(
        `Invalid state:
        The filePipeArguments in the FilePipeService are ${this.filePipeArguments}`
      );
    }

    // If noAutoInit is not set to true, call the init function.
    if (this.filePipeArguments.noAutoInit !== true) {
      this.init();
    }
  }

  /**
   * Initiates the file pipe.
   *
   * <p>
   * Loads the plugins.
   * </p>
   */
  public init() {
    // Loads all plugins
    this.pluginService.loadPlugins(this.filePipeArguments.plugins);

    // Calls the filePipeInit function on all plugins
    this.pluginService.filePipeInit(this.filePipeArguments);
  }

  /**
   * Pipes the file given by the path through the pipeline using the given event.
   *
   * @param pEvent the event of the file (e.g. add, change, ...).
   * @param pFilePath the relative path from the workspace to the file.
   *
   * <p>
   * E.g. the file in 'inputDirectory/pages/index.html' changed. Then the parameter pFilePath
   * should be 'pages/index.html'.
   * </p>
   *
   * @require the path must have the proper format (see description of the param pFilePath).
   */
  public callEvent(pEvent: EFileEvents, pFilePath: string) {
    // Starts calling 'callEvent' on the plugins.
    this.pluginService.callEvent(pEvent, pFilePath);

    // Calls 'callEventEnsured' on all plugins.
    this.pluginService.callEventEnsured(pEvent, pFilePath);

    // Load the content of the file if possible
    let lFileContent = null;

    // The content of a file is not available when the file got removed.
    // Thats why the read function will not get called when the event equals the unlink event.
    if (pEvent !== EFileEvents.unlink) {
      lFileContent = this.fsRead(this.pathIncludeInputDirectory(pFilePath));
    }

    // Bundle file path and content in FilePathAndContentModel.
    let lFilePathAndContentModel: FilePathAndContentModel = {
      path: pFilePath,
      content: lFileContent,
    };

    // Pipes the file through the 'callEventPipe' on the plugins.
    lFilePathAndContentModel = this.pluginService.callEventPipe(lFilePathAndContentModel, pEvent);

    // Executes the corresponding function.
    switch (pEvent) {
      case EFileEvents.add:
        this.addEvent(lFilePathAndContentModel);
        break;

      case EFileEvents.change:
        this.changeEvent(lFilePathAndContentModel);
        break;

      case EFileEvents.unlink:
        this.unlinkEvent(lFilePathAndContentModel);
        break;
    }

    // Starts calling 'callEventAfter' on the plugins.
    this.pluginService.callEvent(pEvent, pFilePath);

    // Calls 'callEventEnsuredAfter' on all plugins.
    this.pluginService.callEventEnsured(pEvent, pFilePath);
  }

  /**
   * Gets called when a file got added.
   *
   * @param pFileModel the path and content of the file.
   */
  private addEvent(pFileModel: FilePathAndContentModel) {
    // Pipes the file through the 'addEventPipe' on the plugins.
    const lfResultingFileModel = this.pluginService.addEventPipe(pFileModel);

    // Starts calling 'addEvent' on the plugins.
    this.pluginService.addEvent(lfResultingFileModel);

    // Calls 'addEventEnsured' on all plugins.
    this.pluginService.addEventEnsured(lfResultingFileModel);

    // Starts calling 'addEventAfter' on the plugins.
    this.pluginService.addEventAfter(lfResultingFileModel);

    // Calls 'addEventEnsuredAfter' on all plugins.
    this.pluginService.addEventEnsuredAfter(lfResultingFileModel);
  }

  /**
   * Gets called when a file got changed.
   *
   * @param pFileModel the path and content of the file.
   */
  private changeEvent(pFileModel: FilePathAndContentModel) {
    // Pipes the file through the 'changeEventPipe' on the plugins.
    const lfResultingFileModel = this.pluginService.changeEventPipe(pFileModel);

    // Starts calling 'changeEvent' on the plugins.
    this.pluginService.changeEvent(lfResultingFileModel);

    // Calls 'changeEventEnsured' on all plugins.
    this.pluginService.changeEventEnsured(lfResultingFileModel);

    // Starts calling 'changeEventAfter' on the plugins.
    this.pluginService.changeEventAfter(lfResultingFileModel);

    // Calls 'changeEventEnsuredAfter' on all plugins.
    this.pluginService.changeEventEnsuredAfter(lfResultingFileModel);
  }

  /**
   * Gets called when a file got removed.
   *
   * <p>
   * The content of the file is not available.
   * </p>
   *
   * @param pFileModel the path and content of the file.
   */
  private unlinkEvent(pFileModel: FilePathAndContentModel) {
    // Pipes the file through the 'unlinkEventPipe' on the plugins.
    const lfResultingFileModel = this.pluginService.unlinkEventPipe(pFileModel);

    // Starts calling 'unlinkEvent' on the plugins.
    this.pluginService.unlinkEvent(lfResultingFileModel);

    // Calls 'unlinkEventEnsured' on all plugins.
    this.pluginService.unlinkEventEnsured(lfResultingFileModel);

    // Starts calling 'unlinkEventAfter' on the plugins.
    this.pluginService.unlinkEventAfter(lfResultingFileModel);

    // Calls 'unlinkEventEnsuredAfter' on all plugins.
    this.pluginService.unlinkEventEnsuredAfter(lfResultingFileModel);
  }
}

// Export default.
export default FilePipeService;
