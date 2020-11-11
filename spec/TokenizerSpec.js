'use strict'

const Tokenizer = require('../tokenizer.js');
const Configuration = require('../configuration.js');
const Cache = require('../cache.js');

describe('Tokenizer', function () {
  let tokenizer;
  let configuration;

  beforeEach(function () {
    Tokenizer.cache = new Cache(10);
    configuration = new Configuration();
    tokenizer = new Tokenizer(configuration);
  });
  it('should stop tokenizing at special characters', function () {
    tokenizer.data('TEST DATA+', 0);
    expect(tokenizer.content()).toEqual('TEST DATA');
  });
  it('should properly initialize when using cached regexes', function () {
    // This test was written specifically for a bug where the default regex
    // wasn't set after a configuration with a cache hit.
    var cached = new Tokenizer(configuration);
    var character = String.fromCharCode(50);

    configuration = new Configuration({ decimalMark: 50 });

    tokenizer.configure(configuration);
    cached.configure(configuration);
    tokenizer.data(character, 0);
    cached.data(character, 0);

    expect(tokenizer.length).toEqual(cached.length);
  });
});