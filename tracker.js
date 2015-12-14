'use strict'

/**
 * A utility class representing the current position in a segment group.
 *
 * @private
 */
class Pointer {
  /**
   * @constructs Pointer
   * @private
   */
  constructor(array, position) {
    this.array = array;
    this.position = position || 0;
    this.count = 0;
  }
  content() {
    return this.array[this.position].content;
  }
  mandatory() {
    return this.array[this.position].mandatory;
  }
  repetition() {
    return this.array[this.position].repetition;
  }
  toString() {
    if (Array.isArray(this.array[this.position].content)) {
      return 'group';
    } else {
      return 'segment ' + this.array[this.position].content;
    }
  }
};

/**
 * A utility class which validates segment order against a given message
 * structure.
 */
class Tracker {
  /**
   * @summary Construct a new tracker pointing to the first segment in the table.
   * @param {Array} table The segment table to track against.
   * @constructs Tracker
   * @private
   */
  constructor(table) {
    this.stack = [];
    this.level = 0;
    this.pointer = new Pointer(table, 0);
    this.stack.push(this.pointer);
  }
  /**
   * @summary Advance the tracker to the next segment in the table.
   * @throws {Error} Throws when the end of the segment table is reached.
   */
  advance() {
    // Advance to the next item in the current group.
    this.pointer.position += 1;
    this.pointer.count = 0;
    if (this.pointer.position === this.pointer.array.length) {
      // We reached the end of this group.
      this.stack.pop();
      if (this.stack.length === 0) {
        throw new Error('Reached the end of the segment table');
      }
      this.pointer = this.stack[this.stack.length - 1];
    }
  }
  /**
   * @summary Match a segment to the message structure and update the current
   * position of the tracker.
   * @param {String} segment The segment name.
   * @throws {Error} Throws if a mandatory segment was omitted.
   * @throws {Error} Throws if unidentified segments are encountered.
   * @throws {Error} Throws if a segment is repeated too much.
   */
  accept(segment) {
    // Pop pointers which do not allow more repetitions of the stack.
    while (this.pointer.count === this.pointer.repetition()) {
      this.advance();
    }
    while (segment !== this.pointer.content()) {
      let repeatable = this.pointer.count === 0 || this.stack.length < this.level;
      // Check if we are omitting mandatory content.
      if (this.level === this.stack.length) {
        if (this.pointer.mandatory() === true && this.pointer.count === 0) {
          throw new Error('A mandatory ' + this.pointer + ' is missing');
        }
      }
      if (Array.isArray(this.pointer.content()) && repeatable) {
        // Enter the subgroup.
        this.level = this.level < this.stack.length ? this.level : this.stack.length;
        this.pointer.count += 1;
        this.pointer = new Pointer(this.pointer.content(), 0);
        this.stack.push(this.pointer);
      } else {
        this.advance();
      }
    }
    this.level = this.stack.length;
    this.pointer.count += 1;
  }
};

module.exports.Tracker = Tracker;
