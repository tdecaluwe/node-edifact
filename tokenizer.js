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

var Cache = require('./cache.js');

var Tokenizer = function (configuration) {
  this._regexes = {
    alpha: /[A-Z]*/g,
    numeric: /[0-9]*/g,
    decimal: /[0-9]*/g
  };

  this.configure(configuration);
  this.reset();
}

Tokenizer.prototype = {
  get length () { return this.buffer.length - this.offset; }
};

Tokenizer.prototype.reset = function () {
  this.buffer = '';
  this.offset = 0;
}

Tokenizer.prototype.configure = function (configuration) {
  var charset;
  var exclude;

  if (Tokenizer.cache.contains(configuration.toString())) {
    this._regexes = Tokenizer.cache.get(configuration.toString());
  } else {
    // Reconfigure if the charset was changed.
    charset = configuration.charset();
    exclude = configuration.delimiters();

    this._regexes = {
      alpha: this._regexes.alpha,
      alphanumeric: Tokenizer.compile(charset, exclude),
      numeric: this._regexes.numeric,
      decimal: this._regexes.decimal
    };

    Tokenizer.cache.insert(configuration.toString(), this._regexes);
  }

  this.alphanumeric();

  return this;
}

Tokenizer.prototype.segment = function (chunk, index) {
  var code;

  // Read segment name data from the buffer.
  var start = index;
  // Consume available ASCII uppercase characters.
  while ((code = chunk.charCodeAt(index) || 0) < 91 && code > 64) {
    index++;
  }
  this.buffer += chunk.slice(start, index);

  return index;
}

Tokenizer.prototype.data = function (chunk, index) {
  this._regex.lastIndex = index;
  this._regex.test(chunk);
  this.buffer += chunk.slice(index, this._regex.lastIndex);
  return this._regex.lastIndex;
}

Tokenizer.prototype.release = function (chunk, index) {
  this.buffer += chunk.charAt(index);
}

Tokenizer.prototype.minus = function () {
  switch (this._regex) {
  case this._regexes.decimal:
  case this._regexes.numeric:
    this.offset += 1;
    if (this.buffer.length !== 0) {
      throw Tokenizer.errors.unexpectedMinus();
    }
  }

  this.buffer += '-';
}

Tokenizer.prototype.decimal = function (chunk, index) {
  var result = '.';

  switch (this._regex) {
  case this._regexes.numeric:
    this._regex = this._regexes.decimal;
    this.offset += 1;
    break;
  case this._regexes.alpha:
  case this._regexes.alphanumeric:
    result = chunk.charAt(index);
    break;
  case this._regexes.decimal:
    throw Tokenizer.errors.secondDecimalMark();
  }

  this.buffer += result;
}

Tokenizer.prototype.alpha = function () {
  this._regex = this._regexes.alpha;
}

Tokenizer.prototype.alphanumeric = function () {
  this._regex = this._regexes.alphanumeric;
}

Tokenizer.prototype.numeric = function () {
  this._regex = this._regexes.numeric;
}

Tokenizer.prototype.content = function () {
  return this.buffer;
}

Tokenizer.compile = function (ranges, chars) {
  var output = '';
  var i = 0, j = 0;
  var minimum = ranges[i] && ranges[i][0];
  while (i < ranges.length && j < chars.length) {
    minimum = Math.max(ranges[i][0], minimum);
    if (minimum < chars[j]) {
      output += String.fromCharCode(minimum, 45, Math.min(ranges[i][1], chars[j]) - 1);
      minimum = Math.min(ranges[i][1], chars[j]);
      i += ranges[i][1] > chars[j] + 1 ? 0 : 1;
    } else {
      minimum = chars[j] + 1;
      j++;
    }
  }
  while (i < ranges.length) {
    output += String.fromCharCode(Math.max(minimum, ranges[i][0]), 45, ranges[i][1] - 1);
    i++;
  }
  return new RegExp('[' + output + ']*', 'g');
}

Tokenizer.cache = new Cache(40);

Tokenizer.modes = {
  alphanumeric: 0,
  alpha: 1,
  numeric: 2,
  decimal: 3
};

Tokenizer.errors = {
  secondDecimalMark: function () {
    var message = 'Cannot accept a second decimal mark while parsing a number';
    return new Error(message);
  },
  unexpectedMinus: function () {
    var message = 'Can only accept a minus at the start of numeric data';
    return new Error(message);
  }
}

module.exports = Tokenizer;
