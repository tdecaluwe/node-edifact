[![view on npm](http://img.shields.io/npm/v/edifact.svg)](https://www.npmjs.org/package/edifact)
[![npm module downloads per month](http://img.shields.io/npm/dm/edifact.svg)](https://www.npmjs.org/package/edifact)

# node-edifact

Currently supported functionality:

* An ES6 streaming parser reading UN/EDIFACT messages.
* Provide your own event listeners to get the parser to do something useful.
* Construct structured javascript objects from UN/EDIFACT messages.
* Support for the UNA header and custom separators.
* Validating data elements and components accepted by a given segment.
* Parsing and checking standard UN/EDIFACT messages with segment tables.

This library further intends to support:

* Writing and constructing UN/EDIFACT messages.
* Out of the box support for envelopes.

## Usage

This example parses a document and translates it to a javascript array `result` containing segments. Each segment is an object containing a `name` and an `elements` array. An element is an array of components.

```javascript
var Parser = require('edifact/parser.js');
var Validator = require('edifact/validator.js');

var doc = ...;

var validator = new Validator();
var parser = new Parser(validator);

// Provide some segment and element definitions.
validator.define(...);

// Parsed segments will be collected in the result array.
var result = [], elements, components;

parser.on('opensegment', function (segment) {
  // Started a new segment.
  elements = [];
  result.push({ name: segment, elements: elements });
});

parser.on('element', function () {
  // Parsed a new element.
  components = [];
  elements.push(components);
});

parser.on('component', function (data) {
  // Got a new component.
  components.push(value);
});

parser.on('closesegment', function () {
  // Closed a segment.
});

parser.write(doc).close();
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

### Performance

Parsing speed including validation but without matching against a segment table is around 20Mbps. Around 30% of the time spent seems to be needed for the validation part.

If performance is critical the event callbacks can also be directly defined as methods on the `Parser` instance. Defining an event callback `on('opensegment', callback)` then becomes:

```
let parser = new Parser();
let callback = function (segment) { ... };

parser.onopensegment = callback;
```

Keep in mind that this avoids any `opensegment` events to be produced and as such, also it's associated overhead.

## Classes

| Class | Description |
| ----- | ----------- |
| [Parser](#Parser) | The `Parser` class encapsulates an online parsing algorithm. By itself it doesn't do anything useful, however the parser can be extended through several event callbacks. |
| [Tracker](#Tracker) | A utility class which validates segment order against a given message structure. |
| [Validator](#Validator) | The `Validator` can be used as an add-on to the `Parser` class, to enable validation of segments, elements and components. This class implements a tolerant validator, only segments and elements for which definitions are provided will be validated. Other segments or elements will pass through untouched. Validation includes:<ul><li>Checking data element counts, including mandatory elements.</li><li>Checking component counts, including mandatory components.</li><li>Checking components against their required format.</li> |
| [Counter](#Counter) | The `Counter` class can be used as a validator for the `Parser` class. However it doesn't perform any validation, it only keeps track of segment, element and component counts. Component counts are reset when starting a new element, just like element counts are reset when closing the segment. |

## Reference

<a name="Parser"></a>
### Parser

A parser capable of accepting data formatted as an UN/EDIFACT interchange. The constructor accepts a `Validator` instance as an optional argument:

```
new Parser([validator])
```

| Function | Description |
| -------- | ----------- |
| `on(event,callback)` | Add a listener for a specific event. The event can be any of `opensegment`, `element`, `component` and `closesegment`. |
| `write(chunk)` | Write a chunk of data to the parser |
| `close()` | Terminate the EDI interchange |

<a name="Tracker"></a>
### Tracker

A utility class which validates segment order against a given message structure. The constructor accepts a segment table as it's first argument:

```
new Tracker(table)
```

| Function | Description |
| -------- | ----------- |
| `advance()` | Advance the tracker to the next position in the segment table. This means the tracker will wrap to the beginning of the segment group if the repetition limit was not exceeded. |
| `accept(segment)` | Match a segment to the message structure and update the current position of the tracker. |

<a name="Validator"></a>
### Validator

The `Validator` can be used to validate segments, elements and components. It keeps track of element and component counts and checks if the component types match those in the segment definition.

```
new Validator()
```

| Function | Description |
| -------- | ----------- |
| `disable()` | Disable validation. |
| `enable()` | Enable validation. |
| `define(definitions)` | Provision the validator with an array of segment and element definitions. |
| `onopensegment(segment)` | Start validation of a new segment |
| `onelement()` | Add an element |
| `onopencomponent(buffer)` | Open a component |
| `onclosecomponent(buffer)` | Close a component |
| `onclosesegment()` | Finish the segment |

The `buffer` argument to both `onopencomponent()` and `onclosecomponent()` should provide three methods `alpha()`, `alphanumeric()`, and `numeric()` allowing the mode of the buffer to be set. It should also expose a `length()` method to check the length of the data currently in the buffer.
