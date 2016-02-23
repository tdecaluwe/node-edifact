'use strict'

/* eslint-env es6 */

class Cache {
  constructor(size) {
    this._data = {};
    this._queue = new Array(size + 1);
    this._begin = 0;
    this._end = size;
  }
  insert(key, value) {
    if (!this.contains(key)) {
      if ((this._end + 2 - this._begin)%this._queue.length === 0) {
        delete this._data[this._queue[this._begin]];
        this._begin = (this._begin + 1)%this._queue.length;
      }
      this._end = (this._end + 1)%this._queue.length;
      this._queue[this._end] = key;
    }
    this._data[key] = value;
  }
  contains(key) {
    return this._data.hasOwnProperty(key);
  }
  get(key) {
    return this._data[key];
  }
}

Cache.errors = {
  notFound: function (key) {
    return new Error('Couldn\'t find object with key' + key + ' in cache');
  }
};

module.exports = Cache;
