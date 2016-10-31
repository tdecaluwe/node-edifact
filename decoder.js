/**
 * @author Tom De Caluwé
 * @copyright 2016 Tom De Caluwé
 * @license GPL-3.0
 *
 * This file is part of node-edifact.
 *
 * The node-edifact library is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Foobar is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * node-edifact. If not, see <http://www.gnu.org/licenses/>.
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
