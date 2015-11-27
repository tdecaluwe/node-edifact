'use strict'

class Pointer {
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
 * Utility class which validates segment order against a given message
 * structure.
 */
class Tracker {
  constructor(message) {
    this.message = message;
    this.stack = [];
    this.level = 0;
    this.pointer = new Pointer(this.message, 1);
    this.stack.push(this.pointer);
  }
  /**
   * @summary Match a segment to the message structure.
   * @param {String} segment The segment name.
   * @throws {Error} Throws if a mandatory segment was omitted.
   * @throws {Error} Throws if unidentified segments are encountered.
   * @throws {Error} Throws if a segment is repeated too much.
   */
  accept(segment) {
    let mandatory;
    while (segment !== this.pointer.content()) {
      let repeatable = this.pointer.count === 0 || this.stack.length < this.level;
      // Check if we are omitting mandatory content.
      if (this.level === this.stack.length) {
        if (this.pointer.mandatory() === true && this.pointer.count === 0) {
          throw new Error('Can\'t omit mandatory ' + this.pointer);
        }
      }
      if (Array.isArray(this.pointer.content()) && repeatable) {
        // Enter the subgroup.
        this.level = this.level < this.stack.length ? this.level : this.stack.length;
        this.pointer.count += 1;
        this.pointer = new Pointer(this.pointer.content(), 0);
        this.stack.push(this.pointer);
      } else {
        this.pointer.position += 1;
        this.pointer.count = 0;
        if (this.pointer.position === this.pointer.array.length) {
          // We reached the end of this group.
          if (this.count > this.pointer.repetition) {
            throw new Error('The message contains too many of ' + this.pointer);
          }
          if (this.stack.length === 0) {
            throw new Error('Cannot match ' + this.pointer + ' to the message structure');
          }
          this.stack.pop();
          this.pointer = this.stack[this.stack.length - 1];
        }
      }
    }
    this.level = this.stack.length;
    this.pointer.count += 1;
  }
};

module.exports.Tracker = Tracker;
