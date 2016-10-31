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

var EventEmitter = require('events');

// This class is a transform stream, designed to extend the set of acceptable
// encodings of the source stream. The constructor accepts an iconv-lite object
// which is used if a requested encoding can't be handled natively by the
// source.
var Translator = function (iconv) {
  var translator = this;

  EventEmitter.call(this);
  this._iconv = iconv;
  this.on('pipe', function (source) {
    translator._source = source;
  });
};

Translator.prototype = Object.create(EventEmitter.prototype);

Translator.prototype.pipe = function (destination) {
  var translator = this;

  this._destination = destination;
  destination.on('drain', function () {
    translator.emit('drain');
  });
  destination.on('finish', function () {
    translator.emit('finish');
  });
  destination.emit('pipe', this);
}

Translator.prototype.decode = function (chunk, encoding, callback) {
  this._destination.write(this._iconv.decode(chunk, this.encoding), encoding, callback);
}

Translator.prototype.setEncoding = function (encoding) {
  try {
    // Ask the source stream to handle the requested encoding.
    this._source.setEncoding(encoding);
    delete this.write;
  } catch (error) {
    // If the source stream doesn't know how to handle this encoding, use iconv.
    this.encoding = encoding;
    this.write = this.decode;
  }
}

// Implement a writable stream interface by forwarding the necessary methods to
// the actual destination.
Translator.prototype.write = function (chunk, encoding, callback) {
  this._destination.write(chunk, encoding, callback);
}
Translator.prototype.cork = function () {
  this._destination.cork();
}

Translator.prototype.uncork = function () {
  this._destination.uncork();
}

Translator.prototype.end = function (chunk, encoding, callback) {
  this._destination.end(chunk, encoding, callback);
}

module.exports = Translator;
