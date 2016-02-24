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

let Cache = require('./cache.js');

class Tokenizer {
  constructor(configuration) {
    this._regexes = {
      alpha: /[A-Z]*/g,
      numeric: /[0-9]*/g,
      decimal: /[0-9]*/g
    };

    this.configure(configuration);
    this._regex = this._regexes.alphanumeric;

    this.buffer = '';
  }
  configure(configuration) {
    let charset;
    let exclude;

    if (Tokenizer.cache.contains(configuration.toString())) {
      this._regexes = Tokenizer.cache.get(configuration.toString());
    } else {
      // Reconfigure if the charset was changed.
      charset = configuration.charset();
      exclude = configuration.delimiters();

      this._regexes.alphanumeric = Tokenizer.compile(charset, exclude);

      Tokenizer.cache.insert(configuration.toString(), {
        alpha: this._regexes.alpha,
        alphanumeric: this._regexes.alphanumeric,
        numeric: this._regexes.numeric,
        decimal: this._regexes.decimal
      });
    }

    return this;
  }
  segment(chunk, index) {
    let code;

    // Read segment name data from the buffer.
    let start = index;
    // Consume available ASCII uppercase characters.
    while ((code = chunk.charCodeAt(index) || 0) < 91 && code > 64) {
      index++;
    }
    this.buffer += chunk.slice(start, index);

    return index;
  }
  data(chunk, index) {
    this._regex.lastIndex = index;
    this._regex.test(chunk);
    this.buffer += chunk.slice(index, this._regex.lastIndex);
    return this._regex.lastIndex;
  }
  release(chunk, index) {
    this.buffer += chunk.charAt(index);
  }
  decimal(chunk, index) {
    let result = '.';

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
  }
  alpha() {
    this._regex = this._regexes.alpha;
  }
  alphanumeric() {
    this._regex = this._regexes.alphanumeric;
  }
  numeric() {
    this._regex = this._regexes.numeric;
  }
  length() {
    return this.buffer.length - (this._regex === this._regexes.decimal ? 1 : 0);
  }
  content() {
    return this.buffer;
  }
  static compile(ranges, chars) {
    let output = '';
    let i = 0, j = 0;
    let minimum = ranges[i] && ranges[i][0];
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
    let message = 'Cannot accept a second decimal mark while parsing a number';
    return new Error(message);
  }
}

module.exports = Tokenizer;
