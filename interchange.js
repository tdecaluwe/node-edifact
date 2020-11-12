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

var Writable = require('stream').Writable;
var Tracker = require('./tracker.js');

/**
 * Construct a new letterbox accepting EDIFACT envelopes. A letterbox is a
 * Writable stream accepting segment objects. Enveloping is optional, so a
 * single message will also be accepted. Groups inside an envelope are optional
 * as well. When used however, every message should be in a group.
 *
 * @constructs Interchange
 */
var Interchange = function (path) {
  var that = this;

  Writable.call(this, {
    write: this.accept,
    objectMode: true
  });

  this.path = path;

  this.depth = {};
  this.depth.current = 0;
  this.depth.minimum = 0;
  this.depth.maximum = 2;

  this.next = function (segment) {
    that.depth.current -= 1;
  };
}

Interchange.prototype = Object.create(Writable.prototype);

function openEnvelope(name, level) {
  var message = '';
  var depth = this.depth.current + 1;

  if (this.depth.current !== level) {
    message += 'Cannot open the ' + name + ' at the current enveloping level';
    throw Error(message);
  } else if (depth > this.depth.maximum) {
    message += 'Cannot open the ' + name + ' since it has been omitted before';
    throw Error(message);
  } else {
    this.depth.current = depth;
    this.depth.minimum = depth;
  }
}

function closeEnvelope(name, level) {
  var message = '';
  var depth = this.depth.current - 1;

  if (depth !== level) {
    message += 'Cannot close the ' + name + ' at the current enveloping level';
    throw Error(message);
  } else {
    this.depth.current = depth;
  }
}

Interchange.prototype.accept = function (segment) {
  // Most of the time we are tracking segments in a message. To optimize for
  // this case we start by detecting if we are currently in the middle of a
  // message. We can do this with only one comparison.
  if (this.depth.current > this.depth.maximum) {
    this.tracker.accept(segment.name);
  } else {
    switch (segment.name) {
    case 'UNB':
      openEnvelope.call(this, 'interchange', 0);
      break;
    case 'UNG':
      openEnvelope.call(this, 'group', 1);
      break;
    case 'UNH':
      if (this.depth.current < this.depth.minimum) {
        throw Error('Cannot omit an envelope');
      } else {
        this.depth.maximum = this.depth.current;
        this.depth.current += 1;
        this.setup(segment);
      }
      break;
    case 'UNE':
      closeEnvelope.call(this, 'group', 1);
      break;
    case 'UNZ':
      closeEnvelope.call(this, 'interchange', 0);
      break;
    default:
      throw Error('Did not expect a ' + segment + ' segment');
    }
  }
}

Interchange.prototype.setup = function (segment) {
  this.cork();
  this.tracker = new Tracker(require(this.path + '/' + segment.components[1]));
  this.tracker.accept(segment.name);
  this.uncork();
};

module.exports = Interchange;
