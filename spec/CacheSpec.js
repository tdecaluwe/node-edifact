'use strict'

let Cache = require('../cache.js');

describe('Cache', function () {
  let cache;
  describe('of size 1', function () {
    beforeEach(function () {
      cache = new Cache(1);
    });
    it('should only contain the last inserted key', function() {
      cache.insert('a', 'value');
      cache.insert('b', 'value');
      expect(cache.contains('a')).toEqual(false);
      expect(cache.contains('b')).toEqual(true);
      cache.insert('c', 'value');
      expect(cache.contains('b')).toEqual(false);
      expect(cache.contains('c')).toEqual(true);
    });
  });
  describe('of size 3', function () {
    beforeEach(function () {
      cache = new Cache(3);
    });
    it('should only contain the three last inserted keys', function() {
      cache.insert('a', 'value');
      cache.insert('b', 'value');
      cache.insert('c', 'value');
      cache.insert('d', 'value');
      expect(cache.contains('a')).toEqual(false);
      expect(cache.contains('b')).toEqual(true);
      expect(cache.contains('c')).toEqual(true);
      expect(cache.contains('d')).toEqual(true);
      cache.insert('e', 'value');
      expect(cache.contains('b')).toEqual(false);
      expect(cache.contains('c')).toEqual(true);
      expect(cache.contains('d')).toEqual(true);
      expect(cache.contains('e')).toEqual(true);
    });
    it('should keep two inserted keys after repeatedly inserting a third one', function() {
      cache.insert('a', 'value');
      cache.insert('b', 'value');
      cache.insert('c', 'value');
      cache.insert('c', 'value');
      cache.insert('c', 'value');
      expect(cache.contains('a')).toEqual(true);
      expect(cache.contains('b')).toEqual(true);
    });
  });
  describe('after adding a key', function () {
    beforeEach(function () {
      cache = new Cache(1);
      cache.insert('key', 'value');
    });
    it('should contain this key', function () {
      expect(cache.contains('key')).toEqual(true);
    });
    it('should return the inserted value', function () {
      expect(cache.get('key')).toEqual('value');
    });
  });
});
