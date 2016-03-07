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
