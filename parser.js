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
      data_element_separator: '+'.codePointAt(0),
      component_data_separator: ':'.codePointAt(0),
      segment_terminator: '\''.codePointAt(0),
      decimal_mark: '.'.codePointAt(0),
      release_character: '?'.codePointAt(0),
      line_feed: '\n'.codePointAt(0),
      carriage_return: '\r'.codePointAt(0)
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
          this._controls.component_data_separator = chunk[3].codePointAt(0);
          this._controls.data_element_separator = chunk[4].codePointAt(0);
          this._controls.decimal_mark = chunk[5].codePointAt(0);
          this._controls.release_character = chunk[6].codePointAt(0);
          this._controls.segment_terminator = chunk[8].codePointAt(0);
          index = 9;
        }
      case Parser.states.segment:
        // Read segment name data from the buffer.
        start = Parser.regexes.segment.lastIndex = index;
        Parser.regexes.segment.test(chunk);
        index = Parser.regexes.segment.lastIndex;
        this._segment += chunk.slice(start, index);
        // Determine the next parser state.
        switch (chunk.codePointAt(index)) {
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
        case undefined:
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
        start = this._validator.regex().lastIndex = index;
        this._validator.regex().test(chunk);
        index = this._validator.regex().lastIndex;
        // Send the data to the validator.
        this._validator.ondata(chunk, start, index);
        // Determine the next parser state.
        switch (chunk.codePointAt(index)) {
        case this._controls.component_data_separator:
          this.oncomponent(this._validator.value());
          this._state = Parser.states.component;
          break;
        case this._controls.data_element_separator:
          this.oncomponent(this._validator.value());
          this._state = Parser.states.element;
          break;
        case this._controls.segment_terminator:
          this.oncomponent(this._validator.value());
          this._validator.onclosesegment(this._segment);
          this.onclosesegment(this._segment);
          this._state = Parser.states.segment;
          this._segment = '';
          break;
        case this._controls.decimal_mark:
          this._validator.ondecimal(chunk.charAt(index));
          this._state = Parser.states.continued;
          break;
        case undefined:
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
      index = index + 1;
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

Parser.regexes = {
  segment: /[A-Z]*/g,
  plain: /[A-Z0-9 ]*/g
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
  regex() {
    return Parser.regexes.plain;
  },
  onopensegment: function (segment) {},
  onelement: function () {},
  oncomponent: function () {
    this._value ='';
  },
  onclosesegment: function (segment) {},
  ondata: function (chunk, start, index) {
    this._value += chunk.slice(start, index);
  },
  decimal: function (character) {
    this._value += character;
  },
  value: function () {
    return this._value;
  }
};

module.exports = Parser;
