# node-edifact

Currently supported functionality (also check the tests to find out what it can and can't do):

* A stream parser reading UN/EDIFACT messages.
* Providing parse events for segments (through the use of hooks).
* Constructing structured javascript objects from UN/EDIFACT messages.
* Support for the UNA header and custom separators.
* Validating data elements and components accepted by a given segment (currently excluding support for mandatory elements and components).

This library further intends to support:

* Writing and constructing UN/EDIFACT messages.
* Parsing and checking standard UN/EDIFACT messages (orders, desadv...).

## Installation

The module can be installled through:

```shell
npm install edifact
```

Keep in mind that this is an ES6 library. It currently can be used with node 4.0 or higher.

## The `Reader` class

This class provides a simple parsing API for everyday use. Using it can be as easy as:

```javascript
let doc = ...;
let reader = new Reader;
let array = reader.parse(doc);
```

The result of `reader.parse(doc)` is an array containing as much segment objects as there are in the original document. The `Reader` class extends the `Parser` class so any methods defined on `Parser` can also be used here.

### `Reader.parse(document, options)`

Parses the document and returns it as a javascript array of segment objects. A segment object has two properties, where the `elements` property itself is an array of components.

```javascript
{
  name: 'SEG',
  elements: [[...], [...]...]
}
```

## The `Parser` class

This is the base class of the `Reader` class and is in fact responsibly for all the heavy lifting. The parser can accept any wellformed UN/EDIFACT document, however validation can be enabled through the `Parser.define` method.

### `Parser.define(key)`

This method can be used to add segment and element definitions. The method accepts a dictionary of such definitions with the segment or element name as the key. If no definition is found for a given segment or element the parser doesn't validate the number and format of the elements and components by default.

An example of a segment definition:

```json
{ "BGM":
  { "requires": 0,
    "elements": ["C002", "C106", "1225", "4343"]
  }
}
```

An example of some element definitions:

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

A working example using segment and element definitions can be found in the `examples` directory. An incomplete set of definitions is included in this module in the files `segments.js` and `elements.js`.

### `Parser.state(key)`

Returns a state variable identified by `key`. The parser provides the state variables `segment` and `elements`.

### `Parser.hook(hook, segment)`

Allows the user to add custom hooks to the parser. The `segment` argument can be used to only call it after parsing specific segments. If this argument is omitted, the hook will be called for every segment.

The `hook` should be a function accepting one argument which the parser will use to pass itself. This allows one to access the current state of the parser:

```javascript
function myCustomHook(parser) {
  let segment = parser.state('segment');
  let element = parser.state('elements')[0];
  ...
}
```
