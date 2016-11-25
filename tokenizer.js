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

'use strict';

var Cache = require('./cache.js');

var Tokenizer = function (configuration) {
  this._regexes = {
    alpha: /[A-Z]*/g,
    numeric: /[0-9]*/g,
    decimal: /[0-9]*/g
  };

  this.configure(configuration);
  this._regex = this._regexes.alphanumeric;

  this.buffer = '';
};

Tokenizer.prototype.configure = function (configuration) {
  var charset;
  var exclude;

  if (Tokenizer.cache.contains(configuration.toString())) {
    this._regexes = Tokenizer.cache.get(configuration.toString());
  } else {
    // Reconfigure if the charset was changed.
    charset = configuration.charset();
    exclude = configuration.delimiters();

    Tokenizer.cache.insert(configuration.toString(), this._regexes = {
      alpha: this._regexes.alpha,
      alphanumeric: Tokenizer.compile(charset, exclude),
      numeric: this._regexes.numeric,
      decimal: this._regexes.decimal
    });

    this.alphanumeric();
  }

  return this;
};

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
};

Tokenizer.prototype.data = function (chunk, index) {
  this._regex.lastIndex = index;
  this._regex.test(chunk);
  this.buffer += chunk.slice(index, this._regex.lastIndex);
  return this._regex.lastIndex;
};

Tokenizer.prototype.release = function (chunk, index) {
  this.buffer += chunk.charAt(index);
};

Tokenizer.prototype.decimal = function (chunk, index) {
  var result = '.';

  switch (this._regex) {
  case this._regexes.numeric:
    this._regex = this._regexes.decimal;
    break;
  case this._regexes.alpha:
  case this._regexes.alphanumeric:
    result = chunk.charAt(index);
    break;
  case this._regexes.decimal:
    throw Tokenizer.errors.secondDecimalMark();
  }
  this.buffer += result;
};

Tokenizer.prototype.alpha = function () {
  this._regex = this._regexes.alpha;
};

Tokenizer.prototype.alphanumeric = function () {
  this._regex = this._regexes.alphanumeric;
};

Tokenizer.prototype.numeric = function () {
  this._regex = this._regexes.numeric;
};

Tokenizer.prototype.length = function () {
  return this.buffer.length - (this._regex === this._regexes.decimal ? 1 : 0);
};

Tokenizer.prototype.content = function () {
  return this.buffer;
};

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
};

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
  }
};

module.exports = Tokenizer;
