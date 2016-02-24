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

/**
 * The `Validator` can be used as an add-on to `Parser` class, to enable
 * validation of segments, elements and components. This class implements a
 * tolerant validator, only segments and elemens for which definitions are
 * provided will be validated. Other segments or elements will pass through
 * untouched. Validation includes:
 * * Checking data element counts, including mandatory elements.
 * * Checking component counts, including mandatory components.
 * * Checking components against they're required format.
 */
class Validator {
  /**
   * @constructs Validator
   * @private
   */
  constructor() {
    this._segments = {};
    this._elements = {};
    this._formats = {};
    this._counts = {
      segment: 0,
      element: 0,
      component: 0
    };
    this._state = Validator.states.all;
  }
  /**
   * @summary Disable validation.
   */
  disable() {
    this._state = Validator.states.none;
  }
  /**
   * @summary Enable validation on the next segment.
   */
  enable() {
    this._state = Validator.states.enable;
  }
  /**
   * To define a segment or element the definitions object should contain the
   * name as a key, and an object describing it's structure as a value. This
   * object contains the `requires` key to define the number of mandatory
   * elements or components. The key `elements` should be included containing a
   * list of element names to describe a segment. Similarly, an element
   * definition contains a `components` array describing the format of the
   * components.
   *
   * To simplify things, a non-composite element is regarded as an element
   * having only one component.
   *
   * @summary Define segment and element structures.
   * @param {Object} definitions An object containing the definitions.
   */
  define(definitions) {
    for (let key in definitions) {
      if (definitions[key].elements && key.length === 3) {
        this._segments[key] = definitions[key];
      }
      if (definitions[key].components && key.length === 4) {
        this._elements[key] = definitions[key];
      }
    }
  }
  /**
   * @summary Request a component definition associated with a format string.
   * @returns {Object} A component definition.
   */
  format(formatString) {
    // Check if we have a component definition in cache for this format string.
    if (this._formats[formatString]) {
      return this._formats[formatString];
    } else {
      let parts;
      if ((parts = /^(a|an|n)(\.\.)?([1-9][0-9]*)?$/.exec(formatString))) {
        let max = parseInt(parts[3]);
        let min = parts[2] === '..' ? 0 : max;
        let alpha, numeric;
        switch (parts[1]) {
        case 'a':
          alpha = true;
          break;
        case 'n':
          numeric = true;
          break;
        case 'an':
          alpha = true;
          numeric = true;
          break;
        }
        return this._formats[formatString] = { alpha: alpha, numeric: numeric, minimum: min, maximum: max };
      } else {
        throw Validator.errors.invalidFormatString(formatString);
      }
    }
  }
  /**
   * @summary Open a new segment.
   * @param {String} segment The segment name.
   */
  onopensegment(segment) {
    switch (this._state) {
    case Validator.states.all:
    case Validator.states.elements:
    case Validator.states.segments:
    case Validator.states.enable:
      // Try to retrieve a segment definition if validation is not turned off.
      if ((this._segment = this._segments[segment])) {
        this._state = Validator.states.enter;
      } else {
        this._state = Validator.states.segments;
      }
    }
    this._counts.segment += 1;
    this._counts.element = 0;
  }
  /**
   * @summary Start validation for a new element.
   */
  onelement() {
    switch (this._state) {
    case Validator.states.all:
      // Check component count of the previous enter.
      if (this._counts.component < this._element.requires) {
        throw Validator.errors.tooFewComponents(this._segment.elements[this._counts.element], this._element.requires, this._counts.component);
      }
      // Fall through to continue with element count validation.
    case Validator.states.enter:
      // Skip component count checks for the first element.
    case Validator.states.elements:
      if ((this._element = this._elements[this._segment.elements[this._counts.element]])) {
        this._state = Validator.states.all;
      } else {
        this._state = Validator.states.elements;
      }
    }
    this._counts.element += 1;
    this._counts.component = 0;
  }
  /**
   * @summary Start validation for a new component.
   * @param {Object} buffer - An object which implements the buffer interface.
   *
   * The buffer object should allow the mode to be set to alpha, numeric or
   * alphanumeric with their corresponding methods.
   */
  onopencomponent(buffer) {
    switch (this._state) {
    case Validator.states.all:
      // Retrieve a component definition if validation is set to all.
      this._component = this.format(this._element.components[this._counts.component]);
      this._minimum = this._component.minimum;
      this._maximum = this._component.maximum;
      // Set the corresponding buffer mode.
      if (this._component.alpha) {
        if (this._component.numeric) {
          buffer.alphanumeric();
        } else {
          buffer.alpha();
        }
      } else {
        if (this._component.numeric) {
          buffer.numeric();
        } else {
          buffer.alphanumeric();
        }
      }
      break;
    default:
      // Set the buffer to it's default mode.
      buffer.alphanumeric();
    }
    this._counts.component += 1;
  }
  onclosecomponent(buffer) {
    let length;

    switch (this._state) {
    case Validator.states.all:
      // Component validation is only needed when validation is set to all.
      length = buffer.length();
      if (length < this._minimum || length > this._maximum) {
        throw Validator.errors.invalidData(buffer.content());
      }
    }
  }
  /**
   * @summary Finish validation for the current segment.
   */
  onclosesegment(segment) {
    switch (this._state) {
    case Validator.states.all:
      if (this._counts.component < this._element.requires) {
        throw Validator.errors.tooFewComponents(this._segment.elements[this._counts.element], this._element.requires, this._counts.component);
      }
      // Fall through to continue with element count validation.
    case Validator.states.elements:
      if (this._counts.element < this._segment.requires) {
        throw Validator.errors.tooFewElements(segment, this._segment.requires, this._counts.element);
      }
    }
  }
}

Validator.states = {
  none: 0,
  enable: 1,
  segments: 2,
  elements: 3,
  enter: 4,
  all: 5
};

Validator.errors = {
  invalidData: function (data) {
    let message = '';
    message += 'Could not accept ' + data;
    return new Error(message);
  },
  invalidFormatString: function (formatString) {
    return new Error('Invalid format string ' + formatString);
  },
  tooFewComponents: function (element, requires, count) {
    let message = '';
    message += 'Element ' + element;
    message += ' only got ' + count + ' components';
    message += ' but requires at least ' + requires;
    return new Error(message);
  },
  tooFewElements: function (segment, requires, count) {
    let message = '';
    message += 'Segment ' + segment;
    message += ' only got ' + count + ' elements';
    message += ' but requires at least ' + requires;
    return new Error(message);
  }
};

module.exports = Validator;
