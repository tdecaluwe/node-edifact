/**
 * @author Tom De Caluwé
 * @copyright 2016 Tom De Caluwé
 * @license Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

/**
 * A utility class representing the current position in a segment group.
 *
 * @private
 */
var Pointer = function (array, position) {
  this.array = array;
  this.position = position || 0;
  this.count = 0;
}

Pointer.prototype.content = function () {
  return this.array[this.position].content;
}

Pointer.prototype.mandatory = function () {
  return this.array[this.position].mandatory;
}

Pointer.prototype.repetition = function () {
  return this.array[this.position].repetition;
}

/**
 * Construct a new tracker pointing to the first segment in the table.
 *
 * @constructs Tracker
 * @param {Array} table The segment table to track against.
 */
var Tracker = function (table) {
  this.stack = [new Pointer(table, 0)];
}

/**
 * Reset the tracker to the initial position of the current segment table.
 */
Tracker.prototype.reset = function () {
  this.stack.length = 1;
  this.stack[0].position = 0;
  this.stack[0].count = 0;
}

/* eslint-disable complexity */

/**
 * Match a segment to the message structure and update the current
 * position of the tracker.
 *
 * @param {String} segment The segment name.
 * @throws {Error} Throws if a mandatory segment was omitted.
 * @throws {Error} Throws if unidentified segments are encountered.
 * @throws {Error} Throws if a segment is repeated too much.
 */
Tracker.prototype.accept = function (segment) {
  var current = this.stack[this.stack.length - 1];
  var optionals = [];
  var probe = 0;
  while (segment !== current.content() || current.count === current.repetition()) {
    if (Array.isArray(current.content()) && current.count < current.repetition()) {
      // Enter the subgroup.
      probe++;
      if (!current.mandatory()) {
        optionals.push(this.stack.length);
      }
      current.count++;
      current = new Pointer(current.content(), 0);
      this.stack.push(current);
    } else {
      // Check if we are omitting mandatory content.
      if (current.mandatory() && current.count === 0) {
        if (optionals.length === 0) {
          // We will never encounter groups here, so we can safely use the
          // name of the segment stored in it's content property.
          throw new Error('A mandatory segment ' + current.content() + ' is missing');
        } else {
          // If we are omitting mandatory content inside a conditional group,
          // we just skip the entire group.
          probe = probe - this.stack.length;
          this.stack.length = optionals.pop();
          current = this.stack[this.stack.length - 1];
          probe = probe + this.stack.length;
        }
      }
      current.position++;
      current.count = 0;
      if (current.position === current.array.length) {
        this.stack.pop();
        current = this.stack[this.stack.length - 1];
        if (this.stack.length === 0) {
          throw new Error('Reached the end of the segment table');
        }
        if (probe === 0 && current.count < current.repetition()) {
          // If we are not currently probing (meaning the tracker actually
          // accepted the group), we should retry the current group, except if
          // the maximum number of repetitions was reached.
          probe++;
          optionals = [this.stack.length];
          current.count++;
          current = new Pointer(current.content(), 0);
          this.stack.push(current);
        } else {
          if (!current.mandatory() || current.count > 1) {
            optionals.pop();
          }
          // Decrease the probing level only if the tracker is currently in a
          // probing state.
          probe = probe > 0 ? probe - 1 : 0;
          // Make sure the tracker won't enter the current group again by
          // setting an appropriate count value on the groups pointer.
          current.count = current.repetition();
        }
      }
    }
  }
  current.count += 1;
  return;
}

/* eslint-enable complexity */

module.exports = Tracker;
