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

var Configuration = function (config) {
  config = config || {};

  this.ST = config.segmentTerminator || 39;
  this.DES = config.dataElementSeparator || 43;
  this.CDS = config.componentDataSeparator || 58;
  this.DM = config.decimalMark || 46;
  this.RC = config.releaseCharacter || 63;
  this.LF = 10;
  this.CR = 13;
  this.EOT = 4;

  this.level = 'UNOA';
};

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
};

/**
 * Return an array containing the ranges accepted by this configurations
 * character set.
 */
Configuration.prototype.charset = function () {
  return Configuration.charsets[this.level];
};

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
  compareAndSwap(exclude, 1, 2);
  compareAndSwap(exclude, 0, 2);
  compareAndSwap(exclude, 2, 4);
  compareAndSwap(exclude, 0, 3);
  compareAndSwap(exclude, 0, 1);
  compareAndSwap(exclude, 2, 3);
  compareAndSwap(exclude, 1, 2);

  return exclude;
};

Configuration.prototype.toString = function () {
  var result = this.level;
  result += String.fromCharCode(this.CDS, this.DES, this.DM, this.RC, this.ST);
  return result;
};

Configuration.charsets = {
  UNOA: [[32, 35], [37, 64], [65, 91]],
  UNOB: [[32, 35], [37, 64], [65, 91], [97, 123]],
  UNOC: [[32, 127], [160, 256]],
  UNOY: [[32, 127], [160, 1114112]],
  UCS2: [[32, 127], [160, 55296], [57344, 65536]]
};

Configuration.errors = {
  invalidEncoding: function (level) {
    var message = 'No definition found for character encoding level ' + level;
    return new Error(message);
  }
};

module.exports = Configuration;
