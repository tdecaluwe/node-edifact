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

var checkComponents = function (validator) {
  var name;

  if (validator._counts.component < validator._element.requires || validator._counts.component > validator._element.components.length) {
    name = validator._segment.elements[validator._counts.element];
    throw Validator.errors.countError('Element', name, validator._element, validator._counts.component);
  }
};

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
var Validator = function () {
  this._segments = {};
  this._elements = {};
  this._formats = {};
  this._counts = {
    segment: 0,
    element: 0,
    component: 0
  };
  this._state = Validator.states.all;
};

/**
 * @summary Disable validation.
 */
Validator.prototype.disable = function () {
  this._state = Validator.states.none;
};

/**
 * @summary Enable validation on the next segment.
 */
Validator.prototype.enable = function () {
  this._state = Validator.states.segments;
};

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
Validator.prototype.define = function (definitions) {
  for (var key in definitions) {
    if (definitions[key].elements) {
      this._segments[key] = definitions[key];
    }
    if (definitions[key].components) {
      this._elements[key] = definitions[key];
    }
  }
};

/**
 * @summary Request a component definition associated with a format string.
 * @returns {Object} A component definition.
 */
Validator.prototype.format = function (formatString) {
  // Check if we have a component definition in cache for this format string.
  if (this._formats[formatString]) {
    return this._formats[formatString];
  } else {
    var parts;
    if ((parts = /^(a|an|n)(\.\.)?([1-9][0-9]*)?$/.exec(formatString))) {
      var max = parseInt(parts[3], 10);
      var min = parts[2] === '..' ? 0 : max;
      var alpha, numeric;
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
      }
      this._formats[formatString] = {
        alpha: alpha,
        numeric: numeric,
        minimum: min,
        maximum: max
      };
      return this._formats[formatString];
    } else {
      throw Validator.errors.invalidFormatString(formatString);
    }
  }
};

/**
 * @summary Open a new segment.
 * @param {String} segment The segment name.
 */
Validator.prototype.onopensegment = function (segment) {
  switch (this._state) {
  case Validator.states.all:
  case Validator.states.elements:
  case Validator.states.segments:
  case Validator.states.enable:
    // Try to retrieve a segment definition if validation is not turned off.
    if ((this._segment = this._segments[segment])) {
      // The onelement function will close the previous element, however we
      // don't want the component counts to be checked. To disable them we put
      // the validator in the elements state.
      this._state = Validator.states.elements;
    } else {
      this._state = Validator.states.segments;
    }
  }
  this._counts.segment += 1;
  this._counts.element = 0;
};

/**
 * @summary Start validation for a new element.
 */
Validator.prototype.onelement = function () {

  switch (this._state) {
  case Validator.states.all:
    // Check component count of the previous enter.
    checkComponents(this);
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
};

/**
 * @summary Start validation for a new component.
 * @param {Object} buffer - An object which implements the buffer interface.
 *
 * The buffer object should allow the mode to be set to alpha, numeric or
 * alphanumeric with their corresponding methods.
 */
Validator.prototype.onopencomponent = function (buffer) {
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
};

Validator.prototype.onclosecomponent = function (buffer) {
  var length;

  switch (this._state) {
  case Validator.states.all:
    // Component validation is only needed when validation is set to all.
    length = buffer.length();
    if (length < this._minimum || length > this._maximum) {
      throw Validator.errors.invalidData(buffer.content());
    }
  }
};

/**
 * @summary Finish validation for the current segment.
 */
Validator.prototype.onclosesegment = function (segment) {
  switch (this._state) {
  case Validator.states.all:
    checkComponents(this);
    // Fall through to continue with element count validation.
  case Validator.states.elements:
    if (this._counts.element < this._segment.requires || this._counts.element > this._segment.elements.length) {
      throw Validator.errors.countError('Segment', segment, this._segment, this._counts.element);
    }
  }
};

Validator.states = {
  // Setting validation to none will disable the validator completely. The
  // validator will not even try to obtain a segment description for segments
  // encountered. Almost all overhead is eliminated in this state.
  none: 0,
  // The segments state implies no segment definition was found for the current
  // segment, so validation should be disabled for its elements and components.
  // Normal validation should be resumed, however, as of the next segment.
  segments: 1,
  // The elements state is equivalent to the segments state, but validation is
  // only temporary disabled for the current element. Normal validation resumes
  // as of the next element.
  elements: 2,
  enter: 4,
  // Validation is enabled for all entities, including segments, elements and
  // components.
  all: 3
};

Validator.errors = {
  invalidData: function (data) {
    var message = '';
    message += 'Could not accept ' + data;
    return new Error(message);
  },
  invalidFormatString: function (formatString) {
    return new Error('Invalid format string ' + formatString);
  },
  countError: function (type, name, definition, count) {
    var array;
    var start = type + ' ' + name, end;
    if (type === 'Segment') {
      array = 'elements';
    } else {
      array = 'components';
    }
    if (count < definition.requires) {
      start += ' only';
      end = ' but requires at least ' + definition.requires;
    } else {
      end = ' but accepts at most ' + definition[array].length;
    }
    return new Error(start + ' got ' + count + ' ' + array + end);
  }
};

module.exports = Validator;
