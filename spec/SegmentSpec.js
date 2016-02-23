'use strict'

import Validator from "../validator.js";
import segments from "../segments.js";
import elements from "../elements.js";

describe('Validator', function () {
  let validator;
  let buffer = {
    alpha: function () {},
    alphanumeric: function () {},
    numeric: function () {},
    length: function () { return 0; }
  };
  beforeEach(function() {
    validator = new Validator();
    validator.define(elements);
    validator.define(segments);
  });
  describe('should only accept conforming segments for segment', function () {
    it('GIN', function () {
      validator.onopensegment('GIN');
      validator.onelement();
      validator.onopencomponent(buffer);
      validator.onclosecomponent(buffer);
      expect(function () { validator.onelement(); }).not.toThrow();
      expect(function () { validator.onelement(); }).toThrow();
      validator.onopencomponent(buffer);
      validator.onclosecomponent(buffer);
      expect(function () { validator.onclosesegment(); }).not.toThrow();
      expect(function () { validator.onelement(); }).not.toThrow();
    });
  });
});
