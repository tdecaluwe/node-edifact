'use strict'

class SegmentTable {
  constructor () {
    this.segments = {};
  }
  addSegment(code, position, required, repetition) {
    this.segments[code] = [position, required, repetition];
  }
};

class Parser {
  constructor() {
    this._hooks = {};
    this._state = {};
    this._regexes = {};
  }
  /**
   * @summary Reset the parser to it's initial state.
   */
  reset() {
    this._index = 0;
    this._state.mode = 'segment';
  }
  /**
   * @summary Request a state variable.
   * @param key The name of the state variable.
   */
  state(key) {
    return this._state[key];
  }
  /**
   * @summary
   * @param {String} input The component string to parse.
   * @param {String} format The format string to parse the input string.
   * @param {Object} options Options to use (like a custom decimal mark).
   *
   * This method will parse an input string using a format string. If succesful
   * it will return the input using an appropriate type, otherwise it will throw
   * an error.
   */
  component(input, format, options) {
    options = options || {};
    let decimal_mark = options.decimal_mark || '.';

    let match;
    let parts;
    if (parts = /^(a|an|n)(\.\.)?([1-9][0-9]*)?$/.exec(format)) {
      let maximum = parseInt(parts[3]);
      let minimum = parts[2] === '..' ? 0 : maximum;
      if (parts[1] === 'a') {
        if (match = /^[A-Za-z ]*$/.exec(input)) {
          if (match[0].length >= minimum && match[0].length <= maximum) {
            return match[0];
          }
        }
      } else if (parts[1] === 'an') {
        if (match = /^[0-9A-Za-z ]*$/.exec(input)) {
          if (match[0].length >= minimum && match[0].length <= maximum) {
            return match[0];
          }
        }
      } else if (parts[1] === 'n') {
        let length;
        if (match = /^([0-9]*)\.?([0-9]*)$/.exec(input)) {
          length = match[1].length + match[2].length;
          if (length >= minimum && length <= maximum) {
            return parseFloat(match[1] + '.' + match[2]);
          }
        }
      }
      throw new Error('Couldn\'t parse ' + input + ' with format string ' + format);
    } else {
      throw new Error('Couldn\'t understand the format string ' + format);
    }
  }
  /**
   * @summary Parse a UN/EDIFACT document.
   * @param {String} input The input document.
   * @param {Object} options Any options to use.
   *
   * This parser behaves similar to a SAX parser. It parses the document but by
   * itself does not construct any output. To get the parser to do anything
   * useful, user-defined hooks should be provided.
   */
  parse(input, options) {
    let match;

    this.reset();
    options = options || {};

    // Read any EDIFACT special characters from options if provided.
    let component_data_separator = options.component_data_separator || ':';
    let data_element_separator = options.data_element_separator || '+';
    let decimal_mark = options.decimal_mark || '.';
    let release_character = options.release_character || '?:';
    let segment_terminator = options.segment_terminator || '\'';

    // Match the UNA header if present.
    let una = /UNA(.)(.)(.)(.)\ (.)/g;
    if (match = una.exec(input)) {
      component_data_separator = match[1];
      data_element_separator = match[2];
      decimal_mark = match[3];
      release_character = match[4];
      segment_terminator = match[5];
      this._index = una.lastIndex;
    }

    // Construct a finite state machine describing the states of the parser.
    let machine = {};
    machine['segment'] = {};
    machine['parameter'] = {};
    machine['element'] = {};
    machine['wrap'] = {};
    machine['segment'][data_element_separator] = 'parameter';
    machine['segment'][segment_terminator] = 'wrap';
    machine['segment']['\n'] = 'segment';
    machine['segment']['\r'] = 'segment';
    machine['parameter'][data_element_separator] = 'parameter';
    machine['parameter'][component_data_separator] = 'element';
    machine['parameter'][segment_terminator] = 'wrap';
    machine['element'][data_element_separator] = 'parameter';
    machine['element'][component_data_separator] = 'element';
    machine['element'][segment_terminator] = 'wrap';
    machine['wrap']['\n'] = 'segment';
    machine['wrap']['\r'] = 'segment';

    // Construct a regex to match tokens from the EDIFACT message.
    let separator = (component_data_separator + '|' + data_element_separator + '|' + segment_terminator + '|\n|\r').replace(/([+?*(){}\[\]])/g, '\\$1');
    let escape = release_character.replace(/([+?*(){}\[\]])/g, '\\$1');
    // A regex with reluctant matchers.
    let expression = '((?:(?:' + escape + ')?.)*?)(' + separator + ')';
    // A regex with greedy matchers.
    //let expression = '((?:' + escape + '.|(?!' + separator + ').)*)(' + separator + ')';
    // A regex based on negative lookaround.
    //let expression = '(.*?)((?<!' + escape + ')' + separator + ')';
    let regex = new RegExp(expression, 'g');
    regex.lastIndex = una.lastIndex;

    // Start reading tokens from the input.
    while (match = regex.exec(input)) {
      let value = match[1];
      let transition = match[2];
      if (this._index !== match.index) {
        throw Error('Unmatched sequence at index ' + this._index + ': ' + value);
      }
      this._state.mode = machine[this._state.mode][transition];
      if (this._state.mode === undefined) {
        throw Error('Invalid character ' + transition + ' after reading: ' + value);
      }
      if (this._state.mode === 'wrap') {
        
      }
      this._index = regex.lastIndex;
    }
  }
};

module.exports.Parser = Parser;
