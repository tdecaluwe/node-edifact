'use strict'

let Letterbox = require('../letterbox.js');

describe('Letterbox', function () {
  let letterbox;
  beforeEach(function () {
    letterbox = new Letterbox();
    spyOn(letterbox, 'track');
  });
  it('should accept a message without an envelope', function () {
    expect(function () { letterbox.write({ name: 'UNH' }); }).not.toThrow();
    expect(letterbox.depth.maximum).toEqual(0);
    expect(letterbox.depth.current).toEqual(1);
    expect(function () { letterbox.next(); }).not.toThrow();
    expect(letterbox.depth.current).toEqual(0);
  });
  it('cannot nest interchanges', function () {
    expect(function () { letterbox.write({ name: 'UNB' }); }).not.toThrow();
    expect(letterbox.depth.minimum).toEqual(1);
    expect(letterbox.depth.current).toEqual(1);
    expect(function () { letterbox.write({ name: 'UNB' }); }).toThrow();
  });
  it('cannot open an interchange after a single message', function () {
    expect(function () { letterbox.write({ name: 'UNH' }); }).not.toThrow();
    expect(letterbox.depth.maximum).toEqual(0);
    expect(letterbox.depth.current).toEqual(1);
    expect(function () { letterbox.next(); }).not.toThrow();
    expect(letterbox.depth.current).toEqual(0);
    expect(function () { letterbox.write({ name: 'UNB' }); }).toThrow();
  });
  it('cannot open a group without an interchange', function () {
    expect(function () { letterbox.write({ name: 'UNG' }); }).toThrow();
  });
  for (var name of ['UNB', 'UNZ', 'UNG', 'UNE']) {
    it('should not validate a ' + name + ' segment while tracking a message', function () {
      // While no valid message contains an enveloping segment in it's segment
      // table, this test is the equivalence of allowing such a messsage
      // definition. Prohibiting enveloping segments in messages should be
      // done by providing a correct segment table, not by algorithm design.
      expect(function () { letterbox.write({ name: 'UNH' }); }).not.toThrow();
      expect(letterbox.depth.maximum).toEqual(0);
      expect(letterbox.depth.current).toEqual(1);
      expect(function () { letterbox.write({ name: name }); }).not.toThrow();
      expect(letterbox.track).toHaveBeenCalled();
    });
  }
  it('should accept a message in an interchange', function () {
    expect(function () { letterbox.write({ name: 'UNB' }); }).not.toThrow();
    expect(letterbox.depth.minimum).toEqual(1);
    expect(letterbox.depth.current).toEqual(1);
    expect(function () { letterbox.write({ name: 'UNH' }); }).not.toThrow();
    expect(letterbox.depth.maximum).toEqual(1);
    expect(letterbox.depth.current).toEqual(2);
    expect(function () { letterbox.next(); }).not.toThrow();
    expect(letterbox.depth.current).toEqual(1);
    expect(function () { letterbox.write({ name: 'UNZ' }); }).not.toThrow();
    expect(letterbox.depth.current).toEqual(0);
  });
  it('should not accept a group after a message', function () {
    expect(function () { letterbox.write({ name: 'UNB' }); }).not.toThrow();
    expect(letterbox.depth.minimum).toEqual(1);
    expect(letterbox.depth.current).toEqual(1);
    expect(function () { letterbox.write({ name: 'UNH' }); }).not.toThrow();
    expect(letterbox.depth.maximum).toEqual(1);
    expect(letterbox.depth.current).toEqual(2);
    expect(function () { letterbox.next(); }).not.toThrow();
    expect(letterbox.depth.current).toEqual(1);
    expect(function () { letterbox.write({ name: 'UNG' }); }).toThrow();
  });
  it('should not accept a group without an interchange', function () {
    expect(function () { letterbox.write({ name: 'UNG' }); }).toThrow();
  });
  it('should not accept a message after a group', function () {
    expect(function () { letterbox.write({ name: 'UNB' }); }).not.toThrow();
    expect(letterbox.depth.minimum).toEqual(1);
    expect(letterbox.depth.current).toEqual(1);
    expect(function () { letterbox.write({ name: 'UNG' }); }).not.toThrow();
    expect(letterbox.depth.minimum).toEqual(2);
    expect(letterbox.depth.current).toEqual(2);
    expect(function () { letterbox.write({ name: 'UNE' }); }).not.toThrow();
    expect(letterbox.depth.current).toEqual(1);
    expect(function () { letterbox.write({ name: 'UNH' }); }).toThrow();
  });
});
