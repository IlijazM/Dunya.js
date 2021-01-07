/**
 * Contains an enum of the different types of file events (e.g. add, change, ...).
 *
 * @packageDocumentation
 */

/**
 * Contains different types of file events e.g. add, remove, change, ...
 */
enum EFileEvents {
  /**
   * Gets used when a file got added.
   */
  add,

  /**
   * Gets used when a file got removed.
   */
  unlink,

  /**
   * Gets used when a file got changed.
   */
  change,
}

// Export default.
export default EFileEvents;
