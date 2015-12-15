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
   * @summary Request a regex usable for accepting component data.
   * @returns {RegExp}
   */
  get regex() {
    return this._regex;
  }
  /**
   * @summary Get the value currently stored in the buffer.
   * @returns {String} The value in the component buffer.
   * @throws {Error} If the buffer doesn't contain a valid component.
   */
  get value() {
    switch (this._regex) {
    case Validator.regexes.integer:
    case Validator.regexes.alpha:
    case Validator.regexes.alphanumeric:
      if (this._value.length < this._component.minimum) {
        throw Validator.errors.invalidData(this._value, this._element.components[this._counts.component]);
      }
      if (this._value.length > this._component.maximum) {
        throw Validator.errors.invalidData(this._value, this._element.components[this._counts.component]);
      }
      break;
    case Validator.regexes.integer:
    case Validator.regexes.decimal:
      if (this._value.length - 1 < this._component.minimum) {
        throw Validator.errors.invalidData(this._value, this._element.components[this._counts.component]);
      }
      if (this._value.length - 1 > this._component.maximum) {
        throw Validator.errors.invalidData(this._value, this._element.components[this._counts.component]);
      }
      this._value = parseFloat(this._value);
      break;
    }
    return this._value;
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
      if (parts = /^(a|an|n)(\.\.)?([1-9][0-9]*)?$/.exec(formatString)) {
        let maximum = parseInt(parts[3]);
        let minimum = parts[2] === '..' ? 0 : maximum;
        let type;
        if (parts[1] === 'a') {
          type = Validator.types.alpha;
        } else if (parts[1] === 'n') {
          type = Validator.types.numeric;
        } else if (parts[1] === 'an') {
          type = Validator.types.alphanumeric;
        }
        return this._formats[formatString] = { type: type, minimum: minimum, maximum: maximum };
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
      if (this._segment = this._segments[segment]) {
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
      if (this._counts.component < this._element.requires) {
        throw Validator.errors.tooFewComponents(this._segment.elements[this._counts.element], this._element.requires, this._counts.component);
      }
    case Validator.states.enter:
    case Validator.states.elements:
      if (this._element = this._elements[this._segment.elements[this._counts.element]]) {
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
   */
  oncomponent() {
    switch (this._state) {
    case Validator.states.all:
      this._component = this.format(this._element.components[this._counts.component]);
      switch (this._component.type) {
      case Validator.types.alpha:
        this._regex = Validator.regexes.alpha;
        break;
      case Validator.types.numeric:
        this._regex = Validator.regexes.integer;
        break;
      case Validator.types.alphanumeric:
        this._regex = Validator.regexes.alphanumeric;
        break;
      }
      break;
    case Validator.states.elements:
    case Validator.states.segments:
    case Validator.states.none:
      this._regex = Validator.regexes.plain;
      break;
    }
    this._counts.component += + 1;
    this._value = '';
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
    case Validator.states.elements:
      if (this._counts.element < this._segment.requires) {
        throw Validator.errors.tooFewElements(segment, this._segment.requires, this._counts.element);
      }
    }
  }
  /**
   * @summary Read a decimal mark.
   * @param {String} character The character being used as a decimal mark.
   * @throws {Error} When the current context doesn't accept a decimal mark.
   */
  ondecimal(character) {
    switch (this._regex) {
    case Validator.regexes.integer:
      this._regex = Validator.regexes.decimal;
      this._value += '.';
      break;
    case Validator.regexes.plain:
    case Validator.regexes.alpha:
    case Validator.regexes.alphanumeric:
      this._value += character;
      break;
    case Validator.regexes.decimal:
      throw Validator.errors.secondDecimalMark();
    }
  }
  /**
   * @summary Read some data.
   */
  ondata(chunk, start, stop) {
    this._value += chunk.slice(start, stop);
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

Validator.regexes = {
  plain: /[A-Z0-9.,\-()/= ]*/g,
  alphanumeric: /[A-Z0-9.,\-()/= ]*/g,
  alpha: /[A-Z.,\-()/= ]*/g,
  integer: /[0-9]*/g,
  decimal: /[0-9]*/g
};

Validator.types = {
  alpha: 0,
  numeric: 1,
  alphanumeric: 2
};

Validator.errors = {
  invalidFormatString: function (formatString) {
    return new Error('Invalid format string ' + formatString);
  },
  secondDecimalMark: function () {
    let message = 'Cannot accept a second decimal mark while parsing a number';
    return new Error(message);
  },
  invalidData: function (data, format) {
    let message = '';
    message += 'Could not accept ' + data;
    message += ' with format ' + format;
    return new Error(message);
  },
  tooFewComponents: function (element, requires, count) {
    let message = '';
    message += 'Element ' + element;
    message += ' requires at least ' + requires + ' components';
    return new Error(message);
  },
  tooFewElements: function (segment, requires, count) {
    let message = '';
    message += 'Segment ' + segment;
    message += ' requires at least ' + requires + ' elements';
    return new Error();
  }
};

module.exports = Validator;
