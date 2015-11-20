# node-edifact

Currently supported functionality (also check the tests to find out what it can and can't do):

* A stream parser reading UN/EDIFACT messages.
* Providing parse events for segments (through the use of hooks).
* Constructing structured javascript objects from UN/EDIFACT messages.
* Support for the UNA header and custom separators.

This library further intends to support:

* Writing and constructing UN/EDIFACT messages.
* Checking data elements and components accepted by a given segment.
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

The result of `reader.parse(doc)` is an array containing as much segment objects as there are in the original document.

### `Reader.parse(document, options)`

Parses the document and returns it as a javascript array of segment objects. A segment object has two properties, where the `elements` property itself is an array of components.

```javascript
{
  name: 'SEG',
  elements: [[...], [...]...]
}
```

### `Reader.state(key)`

Returns a state variable identified by `key`. The parser provides the state variables `segment` and `elements`.

### `Reader.hook(hook, segment)`

Allows the user to add custom hooks to the parser. The `segment` argument can be used to only call it after parsing specific segments. If this argument is omitted, the hook will be called for every segment.

The `hook` should be a function accepting one argument which the parser will use to pass itself. This allows one to access the current state of the parser:

```javascript
function myCustomHook(parser) {
  let segment = parser.state('segment');
  let element = parser.state('elements')[0];
  ...
}
```
