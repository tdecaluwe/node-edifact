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

let Configuration = require('./configuration.js');
let Tokenizer = require('./tokenizer.js');

let EventEmitter = require('events');

/**
 * The `Parser` class encapsulates an online parsing algorithm, similar to a
 * SAX-parser. By itself it doesn't do anything useful, however several
 * callbacks can be provided for different parsing events.
 */
class Parser extends EventEmitter {
  /**
   * @summary Constructs a new parser.
   * @param {Validator} [validator] Accepts a validator class for handling
   * data validation.
   * @constructs Parser
   * @private
   */
  constructor(validator) {
    super();
    this._validator = validator || Parser.defaultValidator;
    this._configuration = new Configuration();
    this._tokenizer = new Tokenizer(this._configuration);
    this.state = Parser.states.empty;
    this.buffer = '';
  }
  onopensegment(segment) {
    this.emit('opensegment', segment);
  }
  onclosesegment() {
    this.emit('closesegment');
  }
  onelement() {
    this.emit('element');
  }
  oncomponent(data) {
    this.emit('component', data);
  }
  /**
   * Set an encoding level.
   * @param {String} level - The encoding level name.
   */
  encoding(level) {
    let previous = this._configuration.level;

    this._configuration.encoding(level);
    if (this._configuration.level !== previous) {
      this._tokenizer.configure(this._configuration);
    }
  }
  /**
   * @summary Ends the EDI interchange.
   * @throws {Error} If more data is expected.
   */
  end() {
    if (this.state !== Parser.states.segment && this._segment !== '') {
      throw Parser.errors.incompleteMessage();
    } else {
      this.state = Parser.states.empty;
    }
  }
  una(chunk) {
    if (/^UNA....\ ./g.test(chunk)) {
      this._configuration.CDS = chunk.charCodeAt(3);
      this._configuration.DES = chunk.charCodeAt(4);
      this._configuration.DM = chunk.charCodeAt(5);
      this._configuration.RC = chunk.charCodeAt(6);
      this._configuration.ST = chunk.charCodeAt(8);
      return true;
    } else {
      return false;
    }
  }
  /**
   * @summary Write some data to the parser.
   * @param {String} chunk A chunk of UN/EDIFACT data.
   */
  write(chunk) {
    // The position of the parser.
    let index = 0;
    if (this.state === Parser.states.continued) {
      this.state = Parser.states.modeset;
    }
    while (index < chunk.length) {
      switch (this.state) {
      case Parser.states.empty:
        index = this.una(chunk) ? 9 : 0;
        this.state = Parser.states.segment;
        break;
      case Parser.states.segment:
        index = this._tokenizer.segment(chunk, index);
        // Determine the next parser state.
        switch (chunk.charCodeAt(index) || this._configuration.EOT) {
        case this._configuration.DES:
          this._validator.onopensegment(this._tokenizer.buffer);
          this.onopensegment(this._tokenizer.buffer);
          this.state = Parser.states.element;
          this._tokenizer.buffer = '';
          break;
        case this._configuration.ST:
          this._validator.onopensegment(this._tokenizer.buffer);
          this.onopensegment(this._tokenizer.buffer);
          this._validator.onclosesegment(this);
          this.onclosesegment();
          this.state = Parser.states.segment;
          this._tokenizer.buffer = '';
          break;
        case this._configuration.EOT:
        case this._configuration.CR:
        case this._configuration.LF:
          break;
        default:
          throw Parser.errors.invalidControlAfterSegment(this._tokenizer.buffer, chunk.charAt(index));
        }
        break;
      case Parser.states.element:
        // Start reading a new element.
        this._validator.onelement();
        this.onelement();
        // Fall through to process the first component.
      case Parser.states.component:
        // Start reading a new component.
        this._validator.onopencomponent(this._tokenizer);
        // Fall through to process the available component data.
      case Parser.states.modeset:
      case Parser.states.continued:
      case Parser.states.data:
        index = this._tokenizer.data(chunk, index);
        // Determine the next parser state.
        switch (chunk.charCodeAt(index) || this._configuration.EOT) {
        case this._configuration.CDS:
          this._validator.onclosecomponent(this._tokenizer);
          this.oncomponent(this._tokenizer.buffer);
          this.state = Parser.states.component;
          this._tokenizer.buffer = '';
          break;
        case this._configuration.DES:
          this._validator.onclosecomponent(this._tokenizer);
          this.oncomponent(this._tokenizer.buffer);
          this.state = Parser.states.element;
          this._tokenizer.buffer = '';
          break;
        case this._configuration.ST:
          this._validator.onclosecomponent(this._tokenizer);
          this.oncomponent(this._tokenizer.buffer);
          this._validator.onclosesegment();
          this.onclosesegment();
          this.state = Parser.states.segment;
          this._tokenizer.buffer = '';
          break;
        case this._configuration.DM:
          this._tokenizer.decimal(chunk, index);
          this.state = Parser.states.data;
          break;
        case this._configuration.RC:
          index++;
          this._tokenizer.release(chunk, index);
          this.state = Parser.states.data;
          break;
        case this._configuration.EOT:
        case this._configuration.CR:
        case this._configuration.LF:
          this.state = Parser.states.data;
          break;
        default:
          throw Parser.errors.invalidCharacter(chunk.charAt(index), index);
        }
      }
      // Consume the control character.
      index++;
    }
  }
}

Parser.states = {
  empty: 0,
  segment: 1,
  element: 2,
  component: 3,
  modeset: 4,
  data: 5
};

Parser.errors = {
  incompleteMessage: function () {
    return new Error('Cannot close an incomplete message');
  },
  invalidCharacter: function (character, index) {
    let message = '';
    message += 'Invalid character ' + character;
    message += ' at position ' + index;
    return new Error(message);
  },
  invalidControlAfterSegment: function (segment, character) {
    let message = '';
    message += 'Invalid character ' + character;
    message += ' after reading segment name ' + segment;
    return new Error(message);
  }
}

Parser.defaultValidator = {
  onopensegment: function () {},
  onelement: function () {},
  oncomponent: function () {},
  onclosesegment: function () {}
};

module.exports = Parser;
