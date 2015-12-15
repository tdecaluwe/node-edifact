'use strict'

/**
 * The `Parser` class encapsulates an online parsing algorithm, similar to a
 * SAX-parser. By itself it doesn't do anything useful, however several
 * callbacks can be provided for different parsing events.
 */
class Parser {
  /**
   * @summary Constructs a new parser.
   * @param {Validator} [validator] Accepts a validator class for handling
   * data validation.
   * @constructs Parser
   * @private
   */
  constructor(validator) {
    function noop () {};
    this._controls = {
      data_element_separator: 43,
      component_data_separator: 58,
      segment_terminator: 39,
      decimal_mark: 46,
      release_character: 63,
      line_feed: 10,
      carriage_return: 13,
      end_of_transmission: 4
    };
    this._validator = validator || Parser.defaultValidator;
    this._state = Parser.states.empty;
    this._segment = '';
    this.onopensegment = noop;
    this.onclosesegment = noop;
    this.onelement = noop;
    this.oncomponent = noop;
  }
  /**
   * @summary Ends the EDI interchange.
   * @throws {Error} If more data is expected.
   */
  close() {
    if (this._state !== Parser.states.segment && this._segment !== '') {
      throw Parser.errors.incompleteMessage();
    } else {
      this._state = Parser.states.empty;
    }
  }
  /**
   * @summary Write some data to the parser.
   * @param {String} chunk A chunk of UN/EDIFACT data.
   */
  write(chunk) {
    // The begin and end position of the current token.
    let start = 0;
    let index = 0;
    while (index < chunk.length) {
      switch (this._state) {
      case Parser.states.empty:
        if (/UNA....\ ./g.test(chunk)) {
          this._controls.component_data_separator = chunk.charCodeAt(3);
          this._controls.data_element_separator = chunk.charCodeAt(4);
          this._controls.decimal_mark = chunk.charCodeAt(5);
          this._controls.release_character = chunk.charCodeAt(6);
          this._controls.segment_terminator = chunk.charCodeAt(8);
          index = 9;
        }
      case Parser.states.segment:
        // Read segment name data from the buffer.
        start = index;
        while (chunk.charCodeAt(index) < 91 && chunk.charCodeAt(index) > 64) {
          index++;
        }
        this._segment += chunk.slice(start, index);
        // Determine the next parser state.
        switch (chunk.charCodeAt(index) || this._controls.end_of_transmission) {
        case this._controls.data_element_separator:
          this._validator.onopensegment(this._segment);
          this.onopensegment(this._segment);
          this._state = Parser.states.element;
          break;
        case this._controls.segment_terminator:
          this._validator.onopensegment(this._segment);
          this.onopensegment(this._segment);
          this._validator.onclosesegment(this._segment);
          this.onclosesegment(this._segment);
          this._state = Parser.states.segment;
          this._segment = '';
          break;
        case this._controls.end_of_transmission:
          index--;
        case this._controls.carriage_return:
        case this._controls.line_feed:
          break;
        default:
          throw Parser.errors.invalidControlAfterSegment(this._segment, chunk.charAt(index));
        }
        break;
      case Parser.states.element:
        // Start reading a new element.
        this._validator.onelement();
        this.onelement();
      case Parser.states.component:
        // Start reading a new component.
        this._validator.oncomponent();
      case Parser.states.continued:
        start = this._validator.regex.lastIndex = index;
        this._validator.regex.test(chunk);
        index = this._validator.regex.lastIndex;
        // Send the data to the validator.
        this._validator.ondata(chunk, start, index);
        // Determine the next parser state.
        switch (chunk.charCodeAt(index) || this._controls.end_of_transmission) {
        case this._controls.component_data_separator:
          this.oncomponent(this._validator.value);
          this._state = Parser.states.component;
          break;
        case this._controls.data_element_separator:
          this.oncomponent(this._validator.value);
          this._state = Parser.states.element;
          break;
        case this._controls.segment_terminator:
          this.oncomponent(this._validator.value);
          this._validator.onclosesegment(this._segment);
          this.onclosesegment(this._segment);
          this._state = Parser.states.segment;
          this._segment = '';
          break;
        case this._controls.decimal_mark:
          this._validator.ondecimal(chunk.charAt(index));
          this._state = Parser.states.continued;
          break;
        case this._controls.end_of_transmission:
          index--;
        case this._controls.carriage_return:
        case this._controls.line_feed:
          this._state = Parser.states.continued;
          break;
        default:
          throw Parser.errors.invalidCharacter(chunk.charAt(index), index);
        }
        break;
      }
      // Consume the control character.
      index++;
    }
    // Allow chained calls.
    return this;
  }
};

Parser.states = {
  empty: 0,
  segment: 1,
  element: 2,
  component: 3,
  continued: 4
};

Parser.errors = {
  incompleteMessage: function () {
    return new Error('Cannot close an incomplete message');
  },
  invalidCharacter: function (character, index) {
    let message = '';
    message += 'Invalid control character ' + character;
    message += ' at position ' + index;
    return new Error(message);
  },
  invalidControlAfterSegment: function (segment, character) {
    let message = '';
    message += 'Invalid control character ' + character;
    message += ' after reading segment ' + segment;
    return new Error(message);
  }
}

Parser.defaultValidator = {
  regex: /[A-Z0-9,\-()/= ]*/g,
  value: '',
  onopensegment: function (segment) {},
  onelement: function () {},
  oncomponent: function () {
    this.value = '';
  },
  onclosesegment: function (segment) {},
  ondata: function (chunk, start, index) {
    this.value += chunk.slice(start, index);
  },
  ondecimal: function (character) {
    this.value += character;
  }
};

module.exports = Parser;
