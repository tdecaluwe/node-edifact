'use strict'

/** The `Counter` class can be used as a validator for the `Parser` class.
 * However it doesn't perform any validation, it only keeps track of segment,
 * element and component counts. Component counts are reset when starting a new
 * element, just like element counts are reset when closing the segment.
 */
class Counter {
  constructor() {
    this._counts = {
      segment: 0,
      element: 0,
      component: 0
    };
  }
  /**
   * @summary Request a regex usable for accepting component data.
   * @returns {RegExp}
   */
  regex() {
    return Counter.regexes.plain;
  }
  /**
   * @summary Increment the segment count.
   * @param {String} The segment name.
   */
  onopensegment(segment) {
    this._counts.segment += 1;
  }
  /**
   * @summary Increment the element count.
   */
  onelement() {
    this._counts.element += 1;
    this._counts.component = 0;
  }
  /**
   * @summary Increment the component count.
   */
  oncomponent() {
    this._counts.component += + 1;
    this._value = '';
  }
  /**
   * @summary Finish validation for the current segment.
   */
  onclosesegment(segment) {
    this._counts.element = 0;
  }
  /**
   * @summary Read a decimal mark.
   * @param The character being used as a decimal mark.
   * @throws {Error} When the current context doesn't accept a decimal mark.
   */
  ondecimal(character) {
    this._value += character;
  }
  /**
   * @summary Read some data.
   */
  ondata(chunk, start, stop) {
    this._value += chunk.slice(start, stop);
  }
  /**
   * @summary Get the value currently stored in the buffer.
   */
  value() {
    return this._value;
  }
}

Counter.regexes = {
  plain: /[A-Z0-9.,\-()/= ]*/g
};

module.exports = Counter;
