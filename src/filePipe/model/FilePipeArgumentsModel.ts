/**
 * Exports an extended version of the PipeArgumentsModel that contains the default arguments of a
 * file pipe.
 *
 * @packageDocumentation
 */

import PipeArgumentsModel from '../../pipe/model/PipeArgumentsModel';

/**
 * Contains the default arguments of a pipe.
 *
 * @author Ilijaz Mehmedovic
 *
 * @version 1.0.0
 */
interface FilePipeArgumentsModel extends PipeArgumentsModel {
  /**
   * The path to the file that gets piped through the pipeline.
   */
  filePath: string;
}

// Export default.
export default FilePipeArgumentsModel;
