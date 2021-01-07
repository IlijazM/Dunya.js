/**
 * Implements the default plugin.
 *
 * @packageDocumentation
 */

import * as fs from 'fs-extra';
import PluginModel from './PipePluginModel';

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
   * Nothing to implement.
   */
  init(): void {
    // Nothing to implement.

    return undefined;
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
    return fs.readFileSync(pPath, 'utf-8');
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
   * @return true, to interrupt other functions.
   */
  fsWrite(pPath: string, pFileContent: string): boolean {
    if (pPath != undefined) {
      // TODO: plugins needs dir name function.
      // this.fs.mkdirs(Path.dirname(path));
      fs.writeFileSync(pPath, pFileContent, 'utf-8');
    }

    return true;
  },

  /**
   * Logs the function name.
   */
  fsMkdirs(): boolean {
    console.log(`[default plugin]: fsMkdirs()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  fsRemove(): boolean {
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
  fsReadJSON(): string {
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
