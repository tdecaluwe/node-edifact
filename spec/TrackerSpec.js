'use strict'

let Tracker = require('../tracker.js');

describe('Tracker', function () {
  let tracker;
  it('shouldn\'t accept unknown segments', function () {
    tracker = new Tracker([
      { content: 'AAA', mandatory: true, repetition: 1 }
    ]);
    expect(function () { tracker.accept('SEG'); }).toThrow();
  });
  it('should throw if omitting a mandatory segment', function () {
    tracker = new Tracker([
      { content: 'AAA', mandatory: true, repetition: 1 },
      { content: 'BBB', mandatory: false, repetition: 1 }
    ]);
    expect(function () { tracker.accept('BBB'); }).toThrow();
  });
  it('can accept the first segment again after a reset', function () {
    tracker = new Tracker([
      { content: 'AAA', mandatory: false, repetition: 1 },
      { content: 'BBB', mandatory: false, repetition: 1 }
    ]);
    expect(function () { tracker.accept('AAA'); }).not.toThrow();
    expect(function () { tracker.accept('BBB'); }).not.toThrow();
    tracker.reset();
    expect(function () { tracker.accept('AAA'); }).not.toThrow();
  });
  describe('expecting a mandatory repeatable segment', function () {
    // Such a segment defines a repetition property higher than one. However
    // a mandatory segment only requires the segment to be included once.
    beforeEach(function () {
      tracker = new Tracker([
        { content: 'AAA', mandatory: true, repetition: 2 },
        { content: 'BBB', mandatory: false, repetition: 1 }
      ]);
    });
    it('can include only one repetition', function () {
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('BBB'); }).not.toThrow();
    });
    it('should not exceed maximum repetitions', function () {
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).toThrow();
    });
  });
  describe('expecting a conditional segment', function () {
    beforeEach(function () {
      tracker = new Tracker([
        { content: 'AAA', mandatory: false, repetition: 2 },
        { content: 'BBB', mandatory: false, repetition: 1 }
      ]);
    });
    it('can skip to the next entry', function () {
      expect(function () { tracker.accept('BBB'); }).not.toThrow();
    });
    it('should not exceed maximum repetitions', function () {
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).toThrow();
    });
  });
  describe('expecting a mandatory group', function () {
    beforeEach(function () {
      tracker = new Tracker([
        { content: [
          { content: 'AAA', mandatory: true, repetition: 1 },
          { content: 'BBB', mandatory: false, repetition: 1 }
        ], mandatory: true, repetition: 2},
        { content: 'CCC', mandatory: false, repetition: 1 }
      ]);
    });
    it('should throw if omitted', function () {
      expect(function () { tracker.accept('CCC'); }).toThrow();
    });
    it('can include only one repetition', function () {
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('CCC'); }).not.toThrow();
    });
    it('should not exceed maximum repetitions', function () {
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('BBB'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('BBB'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).toThrow();
    });
  });
  describe('expecting a conditional group', function () {
    beforeEach(function () {
      tracker = new Tracker([
        { content: [
          { content: 'AAA', mandatory: true, repetition: 1 },
          { content: 'BBB', mandatory: false, repetition: 1 },
        ], mandatory: false, repetition: 3},
        { content: 'DDD', mandatory: false, repetition: 1 }
      ]);
    });
    it('can include only one repetition', function () {
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('DDD'); }).not.toThrow();
    });
    it('can include the maximal number of repetitions', function () {
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('DDD'); }).not.toThrow();
    });
    it('can skip to the next entry', function () {
      expect(function () { tracker.accept('DDD'); }).not.toThrow();
    });
    it('should not exceed maximum repetitions', function () {
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('BBB'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('BBB'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('BBB'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).toThrow();
    });
    it('should include all mandatory elements if included', function () {
      expect(function () { tracker.accept('BBB'); }).toThrow();
    });
  });
  describe('expecting an optional child group', function () {
    beforeEach(function () {
      tracker = new Tracker([
        { content: [
          { content: 'AAA', mandatory: false, repetition: 1 },
          { content: [
            { content: 'BBB', mandatory: false, repetition: 1 }
          ], mandatory: false, repetition: 3}
        ], mandatory: false, repetition: 3}
      ]);
      // Move the current tracker position inside the top-level group.
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
    });
    it('should retry the parent group after skipping the child group', function () {
      // Tests specifically to see what happens after leaving a group while the
      // tracker is in a probing state.
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
    });
  });
  it('can skip a mandatory group without mandatory elements', function () {
    // Checking for mandatory omissions should only be done for segments and not
    // for groups.
    tracker = new Tracker([
      { content: [
        { content: 'AAA', mandatory: false, repetition: 1 },
        { content: 'BBB', mandatory: false, repetition: 1 }
      ], mandatory: true, repetition: 3},
      { content: 'CCC', mandatory: false, repetition: 1 }
    ]);
    expect(function () { tracker.accept('CCC'); }).not.toThrow();
  });
  it('should return from a mandatory path when an omission is encountered', function () {
    tracker = new Tracker([
      { content: [
        { content: [
          { content: 'AAA', mandatory: true, repetition: 1 }
        ], mandatory: true, repetition: 3},
        { content: 'BBB', mandatory: false, repetition: 1 }
      ], mandatory: false, repetition: 3},
      { content: 'CCC', mandatory: false, repetition: 1 }
    ]);
    expect(function () { tracker.accept('BBB'); }).toThrow();
  });
  it('should throw when omitting a mandatory segment after probing for a mandatory group repetition', function () {
    // Repetitions of a mandatory group are actually conditional in the sense
    // that a message can include the mandatory group only once. The tracker is
    // potentially in a different state after probing for such a second
    // repetition. In this test we look at what happens if we omit a mandatory
    // segment after putting the tracker in such a state. It could fail if the
    // mandatory group was added as a return path for omitted mandatory
    // segments, but not removed when leaving the group.
    tracker = new Tracker([
      { content: [
        { content: 'AAA', mandatory: false, repetition: 1 }
      ], mandatory: true, repetition: 5},
      { content: 'BBB', mandatory: true, repetition: 1 },
      { content: 'CCC', mandatory: false, repetition: 1 }
    ]);
    expect(function () { tracker.accept('AAA'); }).not.toThrow();
    expect(function () { tracker.accept('CCC'); }).toThrow();
  });
  it('can repeat a group containing a maximally included subgroup', function () {
    // The subgroup, which is included a maximal number of times, will prompt
    // the tracker to leave, without being in a probing state. This test makes
    // sure this situation does not interfere with the parent group.
    tracker = new Tracker([
      { content: [
        { content: 'AAA', mandatory: false, repetition: 5 },
        { content: [
          { content: 'BBB', mandatory: false, repetition: 5 }
        ], mandatory: false, repetition: 1}
      ], mandatory: false, repetition: 5}
    ]);
    expect(function () { tracker.accept('AAA'); }).not.toThrow();
    expect(function () { tracker.accept('BBB'); }).not.toThrow();
    expect(function () { tracker.accept('AAA'); }).not.toThrow();
  });
});
