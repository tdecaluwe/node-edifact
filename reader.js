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
var Validator = require('./validator.js');

/**
 * The `Reader` class is included for backwards compatibility. It translates an
 * UN/EDIFACT document to an array of segments. Each segment has a `name` and
 * `elements` property where `elements` is an array consisting of component
 * arrays. The class exposes a `parse()` method which accepts the document as a
 * string.
 */
var Reader = function () {
  var result = [], elements, components;
  this._validator = new Validator();
  this._parser = new Parser(this._validator);
  this._validator.define(require('./segments.js'));
  this._validator.define(require('./elements.js'));
  this._result = result;
  this._parser.onopensegment = function (segment) {
    elements = [];
    result.push({ name: segment, elements: elements });
  }
  this._parser.onelement = function () {
    components = [];
    elements.push(components);
  }
  this._parser.oncomponent = function (value) {
    components.push(value);
  }
}

/**
 * Provide the underlying `Validator` with segment or element definitions.
 *
 * @summary Define segment and element structures.
 * @param {Object} definitions An object containing the definitions.
 */
Reader.prototype.define = function (definitions) {
  this._validator.define(definitions);
}

/**
 * @summary Parse a UN/EDIFACT document
 * @param {String} document The input document.
 * @returns {Array} An array of segment objects.
 */
Reader.prototype.parse = function (document) {
  this._parser.write(document).close();
  return this._result;
}

module.exports = Reader;
