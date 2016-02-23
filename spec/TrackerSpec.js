'use strict'

import Tracker from "../tracker.js";

describe('Tracker', function () {
  let tracker;
  let message = [
    { content: 'UNH', mandatory: true, repetition: 1 },
  ];
  beforeEach(function() {
    tracker = new Tracker(message);
  });
  describe('in it\'s initial state', function () {
    it('should throw if a mandatory segment is omitted', function () {
      expect(function () { tracker.accept('SEG'); }).toThrow();
    });
    it('should respect maximum number of segment repetitions', function () {
      expect(function () { tracker.accept('UNH'); }).not.toThrow();
      expect(function () { tracker.accept('UNH'); }).toThrow();
    });
  });
});
