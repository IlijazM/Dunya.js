/**
 * Implements the debug plugin.
 *
 * @packageDocumentation
 */

import PipePluginModel from './PipePluginModel';

/**
 * The debug plugin.
 */
const lfDebugPlugin: PipePluginModel = {
  /**
   * The name of the plugin.
   */
  name: 'debug plugin',

  /**
   * The priority of the plugin.
   *
   * <p>
   * The priority is infinity in order to print debug messages without getting interrupted.
   * </p>
   */
  priority: Infinity,

  /**
   * Logs the function name.
   */
  init(): void {
    console.log(`[default plugin]: init()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  terminate(): boolean {
    console.log(`[default plugin]: terminate()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  terminateEnsured(): void {
    console.log(`[default plugin]: terminateEnsured()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  fsRead(): string {
    console.log(`[default plugin]: fsRead()`);

    return undefined;
  },

  /**
   * Logs the function name.
   */
  fsWrite(): boolean {
    console.log(`[default plugin]: fsWrite()`);

    return undefined;
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
export default lfDebugPlugin;
