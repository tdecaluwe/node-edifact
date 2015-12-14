'use strict'

class Parser {
  constructor(validator) {
    this._controls = {
      data_element_separator: '+'.codePointAt(0),
      component_data_separator: ':'.codePointAt(0),
      segment_terminator: '\''.codePointAt(0),
      decimal_mark: '.'.codePointAt(0),
      release_character: '?'.codePointAt(0),
      line_feed: '\n'.codePointAt(0),
      carriage_return: '\r'.codePointAt(0)
    };
    function noop () {};
    this._validator = validator || Parser.defaultValidator;
    this._state = Parser.states.empty;
    this._segment = '';
    this.onopensegment = noop;
    this.onclosesegment = noop;
    this.onelement = noop;
    this.oncomponent = noop;
  }
  close() {
  }
  write(chunk) {
    // The begin and end position of the current token.
    let start = 0;
    let index = 0;
    while (index < chunk.length) {
      switch (this._state) {
      case Parser.states.empty:
      case Parser.states.segment:
        start = Parser.regexes.segment.lastIndex = index;
        Parser.regexes.segment.test(chunk);
        index = Parser.regexes.segment.lastIndex;
        this._segment += chunk.slice(start, index);
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
        case this._controls.carriage_return:
        case this._controls.line_feed:
          break;
        default:
          throw Parser.errors.invalidControlAfterSegment(this._segment, chunk.charAt(index));
        }
        break;
      case Parser.states.element:
        this._validator.onelement();
        this.onelement();
      case Parser.states.component:
        this._validator.oncomponent();
      case Parser.states.continued:
        start = this._validator.regex().lastIndex = index;
        this._validator.regex().test(chunk);
        index = this._validator.regex().lastIndex;
        this._validator.ondata(chunk, start, index);
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
        case this._controls.carriage_return:
        case this._controls.line_feed:
          this._state = Parser.states.continued;
          break;
        default:
          throw Parser.errors.invalidCharacter(chunk.charAt(index), index);
        }
        break;
      }
      index = index + 1;
    }
    return [];
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
  onopensegment: function (segment) {},
  onelement: function () {},
  oncomponent: function () {
    this._value ='';
  },
  onclosesegment: function (segment) {},
  read: function (chunk, index) {
    let start = Parser.regexes.plain.lastIndex = index;
    Parser.regexes.plain.test(chunk);
    index = Parser.regexes.plain.lastIndex;
    this._value += chunk.slice(start, index);
    return index;
  },
  decimal: function (character) {
    this._value += character;
  },
  value: function () {
    return this._value;
  }
};

module.exports = Parser;
