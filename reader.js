'use strict'

let Parser = require('./parser.js');
let Validator = require('./validator.js');

/**
 * The `Reader` class is included for backwards compatibility. It translates an
 * UN/EDIFACT document to an array of segments. Each segment has a `name` and
 * `elements` property where `elements` is an array consisting of component
 * arrays. The class exposes a `parse()` method which accepts the document as a
 * string.
 */
class Reader {
  /**
   * @constructs Reader
   * @private
   */
  constructor() {
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
  define(definitions) {
    this._validator.define(definitions);
  }
  /**
   * @summary Parse a UN/EDIFACT document
   * @param {String} document The input document.
   * @returns {Array} An array of segment objects.
   */
  parse(document) {
    this._parser.write(document).close();
    return this._result;
  }
};

module.exports = Reader;
