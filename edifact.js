'use strict'

class SegmentTable {
  constructor () {
    this.segments = {};
  }
  addSegment(code, position, required, repetition) {
    this.segments[code] = [position, required, repetition];
  }
};

/**
 * The base Parser class encapsulates an online parsing algorithm which can be
 * extended through the use of user-defined hooks.
 */
class Parser {
  constructor() {
    this._segmentHooks = {};
    this._hooks = [];
    this._state = {};
  }
  /**
   * @summary Reset the parser to it's initial state.
   */
  reset() {
    this._index = 0;
    this._state.mode = 'segment';
    this._state.elements = [];
    this._state.components = [];
  }
  /**
   * @summary Request a state variable.
   * @param key The name of the state variable.
   */
  state(key, value) {
    if (value) {
      this._state[key] = value;
    } else {
      return this._state[key];
    }
  }
  /**
   * @summary Add a hook to the parser.
   * @param {Function} hook The hook to be called after a segment is completed.
   * @param {String} segment The segment triggering this hook.
   *
   * If no segment is provided, the hook will be called after each segment read
   * by the parser.
   */
  hook(hook, segment) {
    if (segment) {
      this._segmentHooks[segment] = this._segmentHooks[segment] || [];
      this._segmentHooks[segment].push(hook);
    } else {
      this._hooks.push(hook);
    }
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
    let release_character = options.release_character || '?';
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
    machine['element'] = {};
    machine['component'] = {};
    machine['wrap'] = {};
    machine['segment'][data_element_separator] = 'element';
    machine['segment'][segment_terminator] = 'wrap';
    machine['segment']['\n'] = 'segment';
    machine['segment']['\r'] = 'segment';
    machine['element'][data_element_separator] = 'element';
    machine['element'][component_data_separator] = 'component';
    machine['element'][segment_terminator] = 'wrap';
    machine['component'][data_element_separator] = 'element';
    machine['component'][component_data_separator] = 'component';
    machine['component'][segment_terminator] = 'wrap';
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
      switch (this._state.mode) {
        case 'segment':
        this._state.segment = value;
        this._state.elements = [];
        break;
        case 'element':
        this._state.components = this._state.elements[this._state.elements.push([]) - 1];
        case 'component':
        this._state.components.push(value);
        break;
      }
      this._state.mode = machine[this._state.mode][transition];
      if (this._state.mode === undefined) {
        throw Error('Invalid character ' + transition + ' after reading: ' + value);
      }
      switch (this._state.mode) {
        case 'wrap':
        for (let i = 0; i < this._hooks.length; i++) {
          this._hooks[i](this);
        }
        if (this._segmentHooks[this._state.segment]) {
          for (let i = 0; i < this._segmentHooks[this._state.segment].length; i++) {
            this._segmentHooks[this._state.segment][i](this);
          }
        }
        break;
      }
      this._index = regex.lastIndex;
    }
  }
};

/**
 * The Reader class extends Parser. It adds a default hook which constructs a
 * javascript array representing the original document.
 */
class Reader extends Parser {
  constructor() {
    super();
    this.hook(Reader.addSegment);
  }
  reset() {
    super.reset();
    this.state('result', []);
  }
  /**
   * @summary Parse the input document and return it as a javascript array.
   * @param {String} input The input document.
   * @param {Object} options Any options to use.
   */
  parse(document, options) {
    super.parse(document, options);
    return this.state('result');
  }
  static addSegment(parser) {
    let segment = {};
    segment.name = parser.state('segment');
    segment.elements = parser.state('elements');
    parser.state('result').push(segment);
  }
};

module.exports.Parser = Parser;
module.exports.Reader = Reader;
