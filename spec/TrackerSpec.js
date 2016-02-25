'use strict'

import Tracker from "../tracker.js";

describe('Tracker', function () {
  let tracker;
  describe('expecting a mandatory segment', function () {
    beforeEach(function () {
      tracker = new Tracker([
        { content: 'AAA', mandatory: true, repetition: 1 },
        { content: 'BBB', mandatory: false, repetition: 1 }
      ]);
    });
    it('shouldn\'t accept unknown segments', function () {
      expect(function () { tracker.accept('SEG'); }).toThrow();
    });
    it('should throw if omitted', function () {
      expect(function () { tracker.accept('BBB'); }).toThrow();
    });
  });
  describe('expecting a mandatory repeatable segment', function () {
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
    it('shouldn\'t accept unknown segments', function () {
      expect(function () { tracker.accept('SEG'); }).toThrow();
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
          { content: 'BBB', mandatory: false, repetition: 1 }
        ], mandatory: false, repetition: 3},
        { content: 'CCC', mandatory: false, repetition: 1 }
      ]);
    });
    it('can include only one repetition', function () {
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('CCC'); }).not.toThrow();
    });
    it('can include the maximal number of repetitions', function () {
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('AAA'); }).not.toThrow();
      expect(function () { tracker.accept('CCC'); }).not.toThrow();
    });
    it('can skip to the next entry', function () {
      expect(function () { tracker.accept('CCC'); }).not.toThrow();
    });
    it('should not exceed maximum repetitions', function () {
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
});
