/**
 * @author Tom De Caluwé
 * @copyright 2016 Tom De Caluwé
 * @license GPL-3.0
 *
 * This file is part of node-edifact.
 *
 * The node-edifact library is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Foobar is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * node-edifact. If not, see <http://www.gnu.org/licenses/>.
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
