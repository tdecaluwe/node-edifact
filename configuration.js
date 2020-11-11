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

var Configuration = function (config) {
  this.level = 'UNOA';

  this.MIN = 45;
  this.LF = 10;
  this.CR = 13;
  this.EOT = 4;

  this.configure(config);
}

/**
 * Configure custom delimiters.
 *
 * @param {Object} config - An object containing custom options.
 */
Configuration.prototype.configure = function (config) {
  config = config || {};

  this.ST = config.segmentTerminator || 39;
  this.DES = config.dataElementSeparator || 43;
  this.CDS = config.componentDataSeparator || 58;
  this.DM = config.decimalMark || 46;
  this.RC = config.releaseCharacter || 63;
}

/**
 * Set the encoding level.
 *
 * @param {String} level - A string identifying the encoding level used.
 */
Configuration.prototype.encoding = function (level) {
  if (Configuration.charsets.hasOwnProperty(level)) {
    this.level = level;
  } else {
    throw Configuration.errors.invalidEncoding(level);
  }
}

/**
 * Return an array containing the ranges accepted by this configurations
 * character set.
 */
Configuration.prototype.charset = function () {
  return Configuration.charsets[this.level];
}
/**
 * Return a sorted array containing the code points of the control characters
 * used by this configuration.
 */
Configuration.prototype.delimiters = function () {
  var compareAndSwap = function (array, a, b) {
    if (array[a] > array[b]) {
      array[a] = array[a] ^ array[b];
      array[b] = array[a] ^ array[b];
      array[a] = array[a] ^ array[b];
    }
  }

  var exclude = [this.ST, this.DES, this.DM, this.CDS, this.RC];

  // Sort the array of excluded characters using a sorting network.
  compareAndSwap(exclude, 1, 2);
  compareAndSwap(exclude, 3, 4);
  compareAndSwap(exclude, 1, 3);
  compareAndSwap(exclude, 0, 2);
  compareAndSwap(exclude, 2, 4);
  compareAndSwap(exclude, 0, 3);
  compareAndSwap(exclude, 0, 1);
  compareAndSwap(exclude, 2, 3);
  compareAndSwap(exclude, 1, 2);

  return exclude;
}
Configuration.prototype.toString = function () {
  var result = this.level;
  result += String.fromCharCode(this.CDS, this.DES, this.DM, this.RC, this.ST);
  return result;
}

Configuration.charsets = {
  UNOA: [[32, 35], [37, 64], [65, 91]],
  UNOB: [[32, 35], [37, 64], [65, 91], [97, 123]],
  UNOC: [[32, 128], [160, 256]],
  UNOY: [[32, 128], [160, 1114112]],
  UCS2: [[32, 128], [160, 55296], [57344, 65536]]
};

Configuration.errors = {
  invalidEncoding: function (level) {
    var message = 'No definition found for character encoding level ' + level;
    return new Error(message);
  }
}

module.exports = Configuration;
