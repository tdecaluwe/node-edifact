'use strict'

let Interchange = require('../interchange.js');

describe('Interchange', function () {
  let interchange;
  beforeEach(function () {
    interchange = new Interchange();
    interchange.tracker = { accept: function () {} };
    spyOn(interchange, 'setup');
    spyOn(interchange.tracker, 'accept');
  });
  it('should accept a message without an envelope', function () {
    expect(function () { interchange.accept({ name: 'UNH' }); }).not.toThrow();
    expect(interchange.depth.maximum).toEqual(0);
    expect(interchange.depth.current).toEqual(1);
    expect(function () { interchange.next(); }).not.toThrow();
    expect(interchange.depth.current).toEqual(0);
  });
  it('cannot nest interchanges', function () {
    expect(function () { interchange.accept({ name: 'UNB' }); }).not.toThrow();
    expect(interchange.depth.minimum).toEqual(1);
    expect(interchange.depth.current).toEqual(1);
    expect(function () { interchange.accept({ name: 'UNB' }); }).toThrow();
  });
  it('cannot open an interchange after a single message', function () {
    expect(function () { interchange.accept({ name: 'UNH' }); }).not.toThrow();
    expect(interchange.depth.maximum).toEqual(0);
    expect(interchange.depth.current).toEqual(1);
    expect(function () { interchange.next(); }).not.toThrow();
    expect(interchange.depth.current).toEqual(0);
    expect(function () { interchange.accept({ name: 'UNB' }); }).toThrow();
  });
  it('cannot open a group without an interchange', function () {
    expect(function () { interchange.accept({ name: 'UNG' }); }).toThrow();
  });
  for (var name of ['UNB', 'UNZ', 'UNG', 'UNE']) {
    it('should not validate a ' + name + ' segment while tracking a message', function () {
      // While no valid message contains an enveloping segment in it's segment
      // table, this test is the equivalence of allowing such a messsage
      // definition. Prohibiting enveloping segments in messages should be
      // done by providing a correct segment table, not by algorithm design.
      expect(function () {
        interchange.accept({ name: 'UNH' });
      }).not.toThrow();
      expect(interchange.depth.maximum).toEqual(0);
      expect(interchange.depth.current).toEqual(1);
      expect(function () { interchange.accept({ name: name }); }).not.toThrow();
      expect(interchange.tracker.accept).toHaveBeenCalled();
    });
  }
  it('should accept a message in an interchange', function () {
    expect(function () { interchange.accept({ name: 'UNB' }); }).not.toThrow();
    expect(interchange.depth.minimum).toEqual(1);
    expect(interchange.depth.current).toEqual(1);
    expect(function () { interchange.accept({ name: 'UNH' }); }).not.toThrow();
    expect(interchange.depth.maximum).toEqual(1);
    expect(interchange.depth.current).toEqual(2);
    expect(function () { interchange.next(); }).not.toThrow();
    expect(interchange.depth.current).toEqual(1);
    expect(function () { interchange.accept({ name: 'UNZ' }); }).not.toThrow();
    expect(interchange.depth.current).toEqual(0);
  });
  it('should not accept a group after a message', function () {
    expect(function () { interchange.accept({ name: 'UNB' }); }).not.toThrow();
    expect(interchange.depth.minimum).toEqual(1);
    expect(interchange.depth.current).toEqual(1);
    expect(function () { interchange.accept({ name: 'UNH' }); }).not.toThrow();
    expect(interchange.depth.maximum).toEqual(1);
    expect(interchange.depth.current).toEqual(2);
    expect(function () { interchange.next(); }).not.toThrow();
    expect(interchange.depth.current).toEqual(1);
    expect(function () { interchange.accept({ name: 'UNG' }); }).toThrow();
  });
  it('should not accept a group without an interchange', function () {
    expect(function () { interchange.accept({ name: 'UNG' }); }).toThrow();
  });
  it('should not accept a message after a group', function () {
    expect(function () { interchange.accept({ name: 'UNB' }); }).not.toThrow();
    expect(interchange.depth.minimum).toEqual(1);
    expect(interchange.depth.current).toEqual(1);
    expect(function () { interchange.accept({ name: 'UNG' }); }).not.toThrow();
    expect(interchange.depth.minimum).toEqual(2);
    expect(interchange.depth.current).toEqual(2);
    expect(function () { interchange.accept({ name: 'UNE' }); }).not.toThrow();
    expect(interchange.depth.current).toEqual(1);
    expect(function () { interchange.accept({ name: 'UNH' }); }).toThrow();
  });
});
