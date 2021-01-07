/**
 * Exports an interface that stores the file path and content.
 *
 * @packageDocumentation
 */

/**
 * Stores the file path and content.
 */
interface FilePathAndContentModel {
  /**
   * The path to the file.
   */
  path: string;

  /**
   * The content to the file.
   */
  content: string;
}

// Export default.
export default FilePathAndContentModel;
