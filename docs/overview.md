[![view on npm](http://img.shields.io/npm/v/edifact.svg)](https://www.npmjs.org/package/edifact)
[![npm module downloads per month](http://img.shields.io/npm/dm/edifact.svg)](https://www.npmjs.org/package/edifact)

# node-edifact

Currently supported functionality:

* An ES6 streaming parser reading UN/EDIFACT messages.
* Provide your own hooks do get the parser to do something useful.
* Construct structured javascript objects from UN/EDIFACT messages.
* Support for the UNA header and custom separators.
* Validating data elements and components accepted by a given segment.
* Parsing and checking standard UN/EDIFACT messages with segment tables.

This library further intends to support:

* Writing and constructing UN/EDIFACT messages.
* Out of the box support for envelopes.

## Usage

This example parses a document and translates it to a javascript array of
segments. Each segment is an object containing a `name` and an `elements`
array. An element is an array of components.

```javascript
var Parser = require('edifact/parser.js');
var Validator = require('edifact/validator.js');

var doc = ...;

var validator = new Validator();
var Parser = new Parser();

// Provide some segment and element definitions.
validator.define(...);

// The `result` will contain an array of segments after parsing the document.
var result = [], elements, components;

parser.onopensegment = function (segment) {
  // Started a new segment.
  elements = [];
  result.push({ name: segment, elements: elements });
}

parser.onelement = function () {
  // Parsed a new element.
  components = [];
  elements.push(components);
}

parser.oncomponent = function (value) {
  // Got a new component.
  components.push(value);
}

parser.onopensegment = function (segment) {
  // Closed a segment.
}

parser.write(document).close();
```

## Installation

The module can be installled through:

```shell
npm install edifact
```

Keep in mind that this is an ES6 library. It currently can be used with node 4.0 or higher.

## Overview

This module is build around a central `Parser` class which provides the core UN/EDIFACT parsing functionality. It only exposes two methods, the `write()` method to write some data to the parser and the `close()` method to close an EDI interchange. Data read by the parser can be read by using hooks which will be called on specific parsing events.

### Segment and element definitions

Definitions can be provided to describe the structure of segments and elements. An example of a segment definition:

```json
{
  "BGM": {
    "requires": 0,
    "elements": ["C002", "C106", "1225", "4343"]
  }
}
```

The `requires` property indicates the number of elements which are required to obtain a valid segment. The `elements` array contains the names of the elements which should be provided. Definitions can also be provided for these elements:

```json
{
  "C002": {
    "requires": 4,
    "components": ["an..3", "an..17", "an..3", "an..35"]
  },
  "C106": {
    "requires": 3,
    "components": ["an..35", "an..9", "an..6"]
  }
}
```

An incomplete set of definitions is included with the library in the files `segments.js` and `elements.js` and can be included as follows:

```javascript
var segments = require('edifact/segments.js');
var elements = require('edifact/elements.js');
```

A working example using segment and element definitions can be found in the `examples` directory.
