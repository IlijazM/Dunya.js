/**
 * Implements the default plugin.
 *
 * @packageDocumentation
 */

import * as fs from 'fs-extra';
import PluginModel from './PipePluginModel';

/**
 * The name of the flag that will store the file encoding value.
 */
const lfFileEncodingFlagName = 'file-encoding';

/**
 * Will store a reference to the flags object of the PipeService.
 */
let lFlags = null;

/**
 * Tries to return the file encoding value from the flags from the PipeService.
 *
 * <p>
 * If this value isn't present, this function will log a warning and will return the encoding
 * 'utf-8'.
 * </p>
 *
 * @return the file encoding value from the flags from the PipeService.
 */
function getFileEncoding() {
  let lResult = 'utf-8';

  if (lFlags === null) {
    // TODO: add warn message
  } else if (lFlags === undefined) {
    // TODO: add warn message
  } else if (lFlags[lfFileEncodingFlagName] == null) {
    // TODO: add warn message
  } else {
    lResult = lFlags[lfFileEncodingFlagName];
  }

  return lResult;
}

/**
 * The default plugin.
 */
const lfDefaultPlugin: PluginModel = {
  /**
   * The name of the plugin.
   */
  name: 'default plugin',

  /**
   * The priority of the plugin.
   */
  priority: 100,

  /**
   * Initiates flags.
   *
   * @param pFlags a reference to the flags of the PipeService.
   */
  init(pFlags: Record<any, any>): void {
    lFlags = pFlags;

    lFlags[lfFileEncodingFlagName] = 'utf-8';
  },

  /**
   * Nothing to implement.
   */
  terminate(): boolean {
    // Nothing to implement.

    return undefined;
  },

  /**
   * Nothing to implement.
   */
  terminateEnsured(): void {
    // Nothing to implement.

    return undefined;
  },

  /**
   * Reads a file and returns the content of it.
   *
   * @param pPath the path of the file.
   * @return the content of the file.
   */
  fsRead(pPath: string): string {
    // Set the result to null in order to interrupt other functions.
    let lResult = null;

    try {
      lResult = fs.readFileSync(pPath, getFileEncoding());
    } catch (pEx) {
      // TODO: create log functions
    }

    return lResult;
  },

  /**
   * Writes content to a file.
   *
   * <p>
   * It also handles the case when the path doesn't exist.
   * </p>
   *
   * @param pPath the path of the file.
   * @param pFileContent the content of the file.
   * @return true, in order interrupt other functions.
   */
  fsWrite(pPath: string, pFileContent: string): boolean {
    if (pPath != undefined) {
      // TODO: plugins needs dir name function.
      // this.fs.mkdirs(Path.dirname(path));
      fs.writeFileSync(pPath, pFileContent, getFileEncoding());
    } else {
      // TODO: create log function
    }

    // Interrupt other functions from getting called.
    return true;
  },

  /**
   * Creates directories.
   *
   * <p>
   * Will also create multiple directories if needed.
   * </p>
   *
   * @param pPath the path of the directories.
   * @return true, in order interrupt other functions.
   */
  fsMkdirs(pPath: string): boolean {
    if (pPath != undefined) {
      fs.mkdirsSync(pPath);
    } else {
      // TODO: create log function
    }

    // Interrupt other functions from getting called.
    return true;
  },

  /**
   * Removes a file or a directory.
   *
   * <p>
   * Automatically detects if the path leads to a file or a directory.
   * </p>
   *
   * @return true, in order interrupt other functions.
   */
  fsRemove(pPath: string): boolean {
    console.log(`[default plugin]: fsRemove()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  fsEmpty(): boolean {
    console.log(`[default plugin]: fsEmpty()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  fsIsDir(): boolean {
    console.log(`[default plugin]: fsIsDir()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  fsExists(): boolean {
    console.log(`[default plugin]: fsExists()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  fsReadJSON(): Record<string, any> {
    console.log(`[default plugin]: fsReadJSON()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  pathJoin(): string {
    console.log(`[default plugin]: pathJoin()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  pathEqual(): boolean {
    console.log(`[default plugin]: pathEqual()`);

    return undefined;
  },
};

// Export default
export default lfDefaultPlugin;
