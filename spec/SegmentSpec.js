'use strict'

import {Validator} from "../index.js";
import * as segments from "../segments.js";
import * as elements from "../elements.js";

describe('Validator', function () {
  let validator;
  beforeEach(function() {
    validator = new Validator();
    validator.define(elements);
    validator.define(segments);
  });
  describe('should only accept conforming segments for segment', function () {
    it('GIN', function () {
      validator.onopensegment('GIN');
      validator.onelement();
      validator.oncomponent();
      expect(function () { validator.onelement(); }).not.toThrow();
      expect(function () { validator.onelement(); }).toThrow();
      validator.oncomponent();
      expect(function () { validator.onclosesegment(); }).not.toThrow();
      expect(function () { validator.onelement(); }).not.toThrow();
    });
  });
});

