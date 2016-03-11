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

var Parser = require('./parser.js');

// A writable stream which accepts EDIFACT documents. The stream can still be
// written to after closing, but it will ben indicated to the parser that a new
// document was started. If the stream is not corked, it will handle all writes
// synchronously since it doesn't have to wait for external resources.
var Decoder = function (validator) {
  this._buffer = [];
  Parser.call(this, validator);
  this.on('pipe', function (source) {
    switch (this._configuration.level) {
    case 'UNOC':
      source.setEncoding('latin1');
      break;
    case 'KECA':
      source.setEncoding('CP949');
      break;
    default:
      source.setEncoding('utf8');
    }
  });
  this._cork = false;
  this._size = 0;
}

Decoder.prototype = Object.create(Parser.prototype);

Decoder.prototype.write = function (chunk, encoding, callback) {
  if (this._cork || this._buffer.length > 0) {
    this._buffer.push({ chunk: chunk, callback: callback });
    this._size += chunk.length;
  } else {
    Parser.prototype.write.call(this, chunk);
    if (callback !== undefined) {
      callback();
    }
  }
  return this._size < 16384;
}

Decoder.prototype.cork = function () {
  this._cork = true;
}

Decoder.prototype.uncork = function () {
  for (var i = 0; i < this._buffer.length; i++) {
    Parser.prototype.write.call(this, this._buffer[i].chunk);
    this._size -= this._buffer[i].chunk.length;
    if (this._buffer[i].callback !== undefined) {
      this._buffer[i].callback();
    }
  }
  this._buffer.length = 0;
  this._cork = false;
  this.emit('drain');
}

Decoder.prototype.end = function (chunk, encoding, callback) {
  if (chunk !== undefined) {
    this.write(chunk, encoding, callback);
  }
  this.uncork();
  Parser.prototype.end.call(this);
  this.emit('finish');
}

module.exports = Decoder;
