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
