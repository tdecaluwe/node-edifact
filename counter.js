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

/**
 * The `Counter` class can be used as a validator for the `Parser` class.
 * However it doesn't perform any validation, it only keeps track of segment,
 * element and component counts. Component counts are reset when starting a new
 * element, just like element counts are reset when closing the segment.
 */
var Counter = function () {
  this.counts = {
    segment: 0,
    element: 0,
    component: 0
  };
}

Counter.prototype.onopensegment = function () {
  this.counts.segment += 1;
}

Counter.prototype.onelement = function () {
  this.counts.element += 1;
  this.counts.component = 0;
}

Counter.prototype.onopencomponent = function () {}

Counter.prototype.onclosecomponent = function () {
  this.counts.component += + 1;
}

Counter.prototype.onclosesegment = function () {
  this.counts.element = 0;
}

module.exports = Counter;
