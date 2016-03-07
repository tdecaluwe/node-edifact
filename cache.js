/**
 * @author Tom De Caluwé
 * @copyright 2016 Tom De Caluwé
 * @license Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

var Cache = function (size) {
  this._data = {};
  this._queue = new Array(size + 1);
  this._begin = 0;
  this._end = size;
}

Cache.prototype.insert = function (key, value) {
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

Cache.prototype.contains = function (key) {
  return this._data.hasOwnProperty(key);
}

Cache.prototype.get = function (key) {
  return this._data[key];
}

module.exports = Cache;
