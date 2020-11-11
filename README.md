[![view on npm](http://img.shields.io/npm/v/edifact.svg)](https://www.npmjs.org/package/edifact)
[![npm module downloads per month](http://img.shields.io/npm/dm/edifact.svg)](https://www.npmjs.org/package/edifact)
[![circleci status](https://img.shields.io/circleci/project/github/tdecaluwe/node-edifact.svg)](https://circleci.com/gh/tdecaluwe/node-edifact)

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

This example parses a document and translates it to a javascript array `result`
containing segments. Each segment is an object containing a `name` and an
`elements` array. An element is an array of components.

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

parser.write(doc)
parser.end();
```

## Installation

The module can be installed through:

```shell
npm install edifact
```

Its only dependency is the node `events` library. Keep in mind that this is an
ES6 library. It currently can be used with node 6.4 or higher. A suite of tests
is included which can be run with the `jasmine-es6` package.

## Overview

This module is built around a central `Parser` class which provides the core
UN/EDIFACT parsing functionality. It exposes two methods, the `write()` method
to write some data to the parser and the `end()` method to close an EDI
interchange. Data read by the parser can be read by using hooks which will be
called on specific parsing events.

### Configuring the parser

The `Parser` class currently supports any of the `UNOA`, `UNOB`, `UNOC`, `UNOY`
and `UCS2` encoding levels. Furthermore, the parser will read any custom
delimiters from the `UNA` header. If such a header is not present in the
document, the delimiters can also be configured manually. The delimiters should
be specified using their character codes. An example:

```javascript
let parser = new Parser();

parser.encoding('UNOC');
parser.configure({
  segmentTerminator: 39,
  dataElementSeparator: 43,
  componentDataSeparator: 58,
  decimalMark: 46,
  releaseCharacter: 63,
});
```

### Parsing events

The parser can be used by listening to the following events:

| Event | Description |
| ----: | :---------- |
| `opensegment` | A new segment is started. The name of the segment is passed as the argument. |
| `element` | A new element is added. This only marks the start of the element, the data will follow through the `component` events. |
| `component` | A component is added to the element. The data is passed on as an argument. |
| `closesegment` | The current segment is terminated. |

For all textual fields the data will be passed on literally to the `component`
event handler. For numeric fields, the decimal mark will be replaced by a point
(`12,4` becomes `12.4` if the decimal mark is a comma). Keep in mind though that
all components will be parsed as alphanumeric fields unless a validator is
used! Only if the component is defined as numeric in the validator can it be
parsed as such.

### Converting EDIFACT to JSON

While the `Parser` class offers a flexible option to write your own EDIFACT
applications, you might only be looking for an easy way read EDIFACT documents.
The `Reader` class offers an easy to use interface:

```javascript
let reader = new Reader({ autoDetectEncoding: true });
let result = reader.parse(document);
```

The `parse()` method returns an array of segments. Each segment is an object
containing a segment `name` and the list of `elements` as an array of arrays
with the actual component data.

### Performance

Parsing speed including validation but without matching against a segment table
is around 20Mbps. Around 30% of the time spent seems to be needed for the
validation part.

If performance is critical the event callbacks can also be directly defined as
methods on the `Parser` instance. Defining an event callback `on('opensegment',
callback)` then becomes:

```javascript
let parser = new Parser();
let callback = function (segment) { ... };

parser.onopensegment = callback;
```

Keep in mind that this avoids any `opensegment` events to be produced and as
such, also its associated overhead.

## Message validation

The validation of the message can be seen as two independent tasks:

* On the one hand the data contained in the elements and components need to
be validated against their format.
* On the other hand the structure of the segments needs to be validated.

### Data validation

Validation of the element and component data can be achieved through the
`Validator` class:

```javascript
var validator = new Validator();
var parser = new Parser();

validator.define(segments);
validator.define(elements);
```

However the `Validator` instance will only validate elements and components
from segments and elements with a corresponding definition. These definitions
can be provided through the `define()` method. Read on to learn more about their
syntax.

### Segment and element definitions

Definitions can be provided to describe the structure of segments and elements.
An example of a segment definition:

```json
{
  "BGM": {
    "requires": 0,
    "elements": ["C002", "C106", "1225", "4343"]
  }
}
```

The `elements` array contains the names of the elements that should be
provided. The `requires` property indicates the number of elements which are
required to obtain a valid segment. Any additional elements are considered
optional. Definitions can also be provided to define the structure of the
elements:

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

An incomplete set of definitions is included with the library in the files
`segments.js` and `elements.js` and can be included as follows:

```javascript
var segments = require('edifact/segments');
var elements = require('edifact/elements');
```

A working example using segment and element definitions can be found in the
`examples` directory.

### Structural validation

Using a parser in conjuction with a `Validator` instance allows validation of
isolated segments, elements and components. However, the parser can also be
extended to validate the message structure. This can be accomplished by using a
`Tracker` instance that will validate the received segments against a segment
table. A set of example EDIFACT messages is included in the module in JSON
format. To extend your parser, the segment can be passed on to the `Tracker` in
the `opensegment` event handler:

```javascript
var table = require('edifact/messages/APERAK');

var parser = new Parser();
var tracker = new Tracker(table);

parser.on('opensegment', function (segment) {
  if (tracker.accept(segment)) doSomething(); // The segment matches.
});

tracker.on('error', function (segment) {
  // Handle the error. Reject the message or ignore the segment.
});
```

Invalid input will generally fall in one of the following categories:

* A mandatory segment is skipped.
* An invalid segment is provided in the input.
* A segment is repeated too much.

However, the `Tracker` instance cannot generally discern between those cases
since it will simply run through the segment table until a match is found. It
will as a consequence fail in one of the following ways:

* The end of the segment table is reached.
* The provided segment doesn't match a mandatory segment in the segment table.
* If either of the above conditions results from a segment that exceeded its
allowed number of repetitions, the `Tracker` instance will detect this and
trigger a more appropriate error.

When such a situation is encountered, an `error` event will be fired. It is up
to the user to handle the error. In the error handler, the current segment can
be accessed through `this.segment`. The current position in the segment table
can be retrieved through `this.pointer`.

If you want to build your own segment tables, please take a look in the
`messages` folder to get the syntax right. Every segment in the segment table is
of the following format:

```json
{ "content": "UNH", "mandatory": true, "repetition": 1 }
```

A segment group can be written as follows:

```json
{ "content": [
  { "content": "NAD", "mandatory": true, "repetition": 1 },
  { "content": "CTA", "mandatory": false, "repetition": 9 },
  { "content": "COM", "mandatory": false, "repetition": 9 }
], "mandatory": false, "repetition": 9 }
```

## Classes

| Class | Description |
| ----: | :---------- |
| [Parser](#Parser) | The `Parser` class encapsulates an online parsing algorithm. By itself it doesn't do anything useful, however the parser can be extended through several event callbacks. |
| [Reader](#Reader) | The `Reader` offers a fast an easy to use interface to convert EDIFACT messages to a JSON structure. |
| [Tracker](#Tracker) | A utility class which validates segment order against a given message structure. |
| [Validator](#Validator) | The `Validator` can be used as an add-on to the `Parser` class, to enable validation of segments, elements and components. This class implements a tolerant validator, only segments and elements for which definitions are provided will be validated. Other segments or elements will pass through untouched. Validation includes:<ul><li>Checking data element counts, including mandatory elements.</li><li>Checking component counts, including mandatory components.</li><li>Checking components against their required format.</li> |
| [Counter](#Counter) | The `Counter` class can be used as a validator for the `Parser` class. However it doesn't perform any validation, it only keeps track of segment, element and component counts. Component counts are reset when starting a new element, just like element counts are reset when closing the segment. |

## Reference

<a name="Parser"></a>
### Parser

A parser capable of accepting data formatted as an UN/EDIFACT interchange. The
constructor accepts a `Validator` instance as an optional argument:

```
new Parser([validator])
```

| Function | Description |
| -------: | :---------- |
| `configure(config)` | Configure any custom delimiters |
| `encoding(level)` | Set one of the predefined encoding levels |
| `on(event,callback)` | Add a listener for a specific event. The event can be any of `opensegment`, `element`, `component` and `closesegment` |
| `write(chunk)` | Write a chunk of data to the parser |
| `end()` | Terminate the EDI interchange |

<a name="Parser"></a>
### Reader

The `Reader` offers a fast an easy to use interface to convert EDIFACT messages
to a JSON structure. Furthermore, the `Reader` class can also autodetect the
message encoding (this feature can be turned off by passing
`autoDetectEncoding: false` as an option to the constructor).

```
new Reader(options)
```

| Function | Description |
| -------: | :---------- |
| `parse(document)` | Parse a document and return the result as an array of segments. |
| `define(definitions)` | Provide the underlying `Validator` instance with definitions. |

<a name="Tracker"></a>
### Tracker

A utility class which validates segment order against a given message
structure. The constructor accepts a segment table as it's first argument:

```
new Tracker(table)
```

| Function | Description |
| -------: | :---------- |
| `accept(segment)` | Match a segment to the message structure and update the current position of the tracker |
| `on(event,callback)` | Use this to add a listener for the `error` event |
| `reset()` | Reset the tracker to the initial position of the current segment table |

<a name="Validator"></a>
### Validator

The `Validator` can be used to validate segments, elements and components. It
keeps track of element and component counts and will ensure the correct data
syntax.

Note that the `Validator` will not throw any errors though, since it only keeps
the `Parser` from consuming any invalid data. It will be the parser that throws
the error when it encounters data that it cannot consume.

```
new Validator()
```

| Function | Description |
| -------: | :---------- |
| `disable()` | Disable validation |
| `enable()` | Enable validation |
| `define(definitions)` | Provision the validator with an array of segment and element definitions |
| `onopensegment(segment)` | Start validation of a new segment |
| `onelement()` | Add an element |
| `onopencomponent(tokenizer)` | Open a component |
| `onclosecomponent(tokenizer)` | Close a component |
| `onclosesegment()` | Finish the segment |

The `tokenizer` argument to both `onopencomponent()` and `onclosecomponent()`
should provide three methods `alpha()`, `alphanumeric()`, and `numeric()`
allowing the mode of the buffer to be set. It should also expose a `length`
property to check the length of the data currently in the buffer.

<a name="Counter"></a>
### Counter

The `Counter` class implements the same interface as `the `Validator` class and
can also be used as a validator when constructing a new `Parser` instance.
However it doesn't perform any validation. It only keeps track of segment,
element and component counts. Component counts are reset when starting a new
element, just like element counts are reset when closing the segment.

```
new Counter()
```

| Function | Description |
| -------: | :---------- |
| `onopensegment()` | Start a new segment |
| `onelement()` | Add an element |
| `onopencomponent()` | Open a component |
| `onclosecomponent()` | Close a component |
| `onclosesegment()` | Finish the segment |
