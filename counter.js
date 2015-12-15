'use strict'

/**
 * The `Counter` class can be used as a validator for the `Parser` class.
 * However it doesn't perform any validation, it only keeps track of segment,
 * element and component counts. Component counts are reset when starting a new
 * element, just like element counts are reset when closing the segment.
 */
class Counter {
  /**
   * @constructs Counter
   * @private
   */
  constructor() {
    this._counts = {
      segment: 0,
      element: 0,
      component: 0
    };
  }
  get regex() {
    return Counter.regexes.plain;
  }
  onopensegment(segment) {
    this._counts.segment += 1;
  }
  onelement() {
    this._counts.element += 1;
    this._counts.component = 0;
  }
  oncomponent() {
    this._counts.component += + 1;
    this._value = '';
  }
  onclosesegment(segment) {
    this._counts.element = 0;
  }
  ondecimal(character) {
    this._value += character;
  }
  ondata(chunk, start, stop) {
    this._value += chunk.slice(start, stop);
  }
  value() {
    return this._value;
  }
}

Counter.regexes = {
  plain: /[A-Z0-9.,\-()/= ]*/g
};

module.exports = Counter;
