'use strict'

let Validator = require('../validator.js');

describe('Validator', function () {
  let validator;
  let buffer = {
    alpha: function () {},
    alphanumeric: function () {},
    numeric: function () {},
    length: function () { return 0; }
  };
  describe('with only segment defintions', function () {
    beforeEach(function () {
      validator = new Validator();
      validator.define({
        AAA: { requires: 1, elements: ['A000', 'A001'] }
      });
    });
    it('should throw if the required elements aren\'t provided', function () {
      validator.onopensegment('AAA');
      expect(function () { validator.onclosesegment(); }).toThrow();
    });
    it('should throw if too many elements are provided', function () {
      validator.onopensegment('AAA');
      validator.onelement();
      validator.onelement();
      validator.onelement();
      expect(function () { validator.onclosesegment(); }).toThrow();
    });
  });
  describe('with segment and element defintions', function () {
    beforeEach(function () {
      validator = new Validator();
      validator.define({
        AAA: { requires: 0, elements: ['A000', 'A001'] }
      });
    });
    it('should throw if the required components aren\'t provided', function () {
      validator.define({ A000: { requires: 1, components: ['a3'] } });
      validator.onopensegment('AAA');
      validator.onelement();
      expect(function () { validator.onelement(); }).toThrow();
    });
    it('should throw if too many components are provided', function () {
      validator.define({ A000: { requires: 0, components: ['a3'] } });
      validator.onopensegment('AAA');
      validator.onelement();
      validator.onopencomponent(buffer);
      expect(function () {
        validator.onopencomponent(buffer);
        validator.onelement();
      }).toThrow();
    });
    it('set the appropriate mode on the buffer', function () {
      validator.define({ A000: { requires: 0, components: ['a3', 'an3', 'n3'] } });
      spyOn(buffer, 'alpha');
      spyOn(buffer, 'alphanumeric');
      spyOn(buffer, 'numeric');
      validator.onopensegment('AAA');
      validator.onelement();
      validator.onopencomponent(buffer);
      expect(buffer.alpha).toHaveBeenCalled();
      expect(buffer.alphanumeric).not.toHaveBeenCalled();
      validator.onopencomponent(buffer);
      expect(buffer.alphanumeric).toHaveBeenCalled();
      expect(buffer.numeric).not.toHaveBeenCalled();
      validator.onopencomponent(buffer);
      expect(buffer.numeric).toHaveBeenCalled();
    });
  });
});
