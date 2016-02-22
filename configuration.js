'use strict'

/* eslint-env es6 */

class Configuration {
  constructor(config) {
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
  }
  /**
   * Set the encoding level.
   *
   * @param {String} level - A string identifying the encoding level used.
   */
  encoding(level) {
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
  charset() {
    return Configuration.charsets[this.level];
  }
  /**
   * Return a sorted array containing the code points of the control characters
   * used by this configuration.
   */
  delimiters() {
    let compareAndSwap = function (array, a, b) {
      if (array[a] > array[b]) {
        array[a] = array[a] ^ array[b];
        array[b] = array[a] ^ array[b];
        array[a] = array[a] ^ array[b];
      }
    }

    let exclude = [this.ST, this.DES, this.DM, this.CDS, this.RC];

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
  }
  toString() {
    let result = this.level;
    result += String.fromCharCode(this.CDS, this.DES, this.DM, this.RC, this.ST);
    return result;
  }
}

Configuration.charsets = {
  UNOA: [[32, 33], [40, 42], [44, 48], [48, 58], [61, 62], [65, 91]],
  UNOB: [[32, 35], [37, 64], [65, 91], [97, 123]],
  UNOC: [[32, 128], [160, 256]],
  UNOY: [[32, 128], [160, 1114112]],
  UCS2: [[32, 128], [160, 55296], [57344, 65536]]
};

Configuration.errors = {
  invalidEncoding: function (level) {
    let message = 'No definition found for character encoding level ' + level;
    return new Error(message);
  }
}

module.exports = Configuration;
