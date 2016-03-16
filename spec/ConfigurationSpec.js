'use strict'

let Configuration = require('../configuration.js');

describe('Configuration', function () {
  let configuration;
  beforeEach(function () {
    configuration = new Configuration();
  });
  it('should accept known encodings', function () {
    expect(function () { configuration.encoding('UNOA'); }).not.toThrow();
    expect(function () { configuration.encoding('UNOB'); }).not.toThrow();
    expect(function () { configuration.encoding('UNOC'); }).not.toThrow();
  });
  it('should reject unknown encodings', function () {
    expect(function () { configuration.encoding('ENCODING'); }).toThrow();
  });
  it('should return the delimiters as a sorted array', function () {
    var count = 0;

    var run = function (permutation) {
      var delimiters;

      configuration.ST = permutation[0];
      configuration.DES = permutation[1];
      configuration.CDS = permutation[2];
      configuration.DM = permutation[3];
      configuration.RC = permutation[4];

      delimiters = configuration.delimiters();
      for (var i = 1; i < delimiters.length; i++) {
        expect(delimiters[i]).toBeGreaterThan(delimiters[i - 1]);
      }
      count++;
    }

    var permute = function (head, tail, callback) {
      var item;
      if (tail.length === 0) {
        callback(head);
      } else {
        for (var i = 0; i < tail.length; i++) {
          item = tail[i];
          tail.splice(i, 1);
          head.push(item);
          permute(head, tail, callback);
          head.pop();
          tail.splice(i, 0, item);
        }
      }
    }

    permute([], [0, 1, 2, 3, 4], run);
    expect(count).toEqual(120);
  });
});
