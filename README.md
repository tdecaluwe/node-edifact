[![view on npm](http://img.shields.io/npm/v/edifact.svg)](https://www.npmjs.org/package/edifact)
[![npm module downloads per month](http://img.shields.io/npm/dm/edifact.svg)](https://www.npmjs.org/package/edifact)

# node-edifact

Currently supported functionality:

* A stream parser reading UN/EDIFACT messages.
* Provide your own hooks do get the parser to do something useful.
* Construct structured javascript objects from UN/EDIFACT messages.
* Support for the UNA header and custom separators.
* Validating data elements and components accepted by a given segment.
* Parsing and checking standard UN/EDIFACT messages with segment tables.

This library further intends to support:

* Writing and constructing UN/EDIFACT messages.
* Out of the box support for envelopes.

## Installation

The module can be installled through:

```shell
npm install edifact
```

Keep in mind that this is an ES6 library. It currently can be used with node 4.0 or higher.

## Overview

This module provides two main classes, the `Parser` and the `Reader` class. The `Parser` base class only contains the bare stream parser but doesn't do anything useful with the data read. It can be customized through the use of hooks and the addition of segment and element definitions.

The `Reader` class inherits the parser class and intends to build usable javascript objects from UN/EDIFACT messages. Segment and element definitions should still be provided by the user. If no such definitions are found, element and component validation is skipped. Using this class can be as easy as:

```javascript
let doc = ...;
let reader = new Reader;
let array = reader.parse(doc);
```

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

An incomplete set of definitions is included with the library in the files `segments.js` and `elements.js` and can be included as follows:

```javascript
let reader = new edifact.Reader;

reader.define(require('edifact/segments.js'));
reader.define(require('edifact/elements.js'));
```

A working example using segment and element definitions can be found in the `examples` directory.

## Reference

### Classes
<dl>
<dt><a href="#Parser">Parser</a></dt>
<dd><p>The base Parser class encapsulates an online parsing algorithm, similar to a
SAX-parser. By itself it doesn&#39;t do anything useful, however it can be
customized through the use of user-defined hooks segment and element
definitions.</p>
</dd>
<dt><a href="#Reader">Reader</a> ⇐ <code><a href="#Parser">Parser</a></code></dt>
<dd><p>The Reader class provides an easy to use parsing interface to convert
UN/EDIFACT documents to an array of javascript objects, representing the
segments in the original document.</p>
<p>If a message type is provided in the UNH segment, it will try to validate the
message using an appropriate segment table, if the parser can find one.</p>
</dd>
<dt><a href="#Tracker">Tracker</a></dt>
<dd><p>A utility class which validates segment order against a given message
structure.</p>
</dd>
</dl>
<a name="Parser"></a>
### Parser
The base Parser class encapsulates an online parsing algorithm, similar to a
SAX-parser. By itself it doesn't do anything useful, however it can be
customized through the use of user-defined hooks segment and element
definitions.

**Kind**: global class  

* [Parser](#Parser)
  * [.reset()](#Parser+reset)
  * [.state(key)](#Parser+state) ⇒
  * [.hook(hook, [segment])](#Parser+hook)
  * [.define(definitions, options)](#Parser+define)
  * [.component(input, format, options)](#Parser+component) ⇒
  * [.parse(input, options)](#Parser+parse)

<a name="Parser+reset"></a>
#### parser.reset()
**Kind**: instance method of <code>[Parser](#Parser)</code>  
**Summary**: Reset the parser to it&#x27;s initial state.  
<a name="Parser+state"></a>
#### parser.state(key) ⇒
**Kind**: instance method of <code>[Parser](#Parser)</code>  
**Summary**: Request a state variable.  
**Returns**: The state associated with the provided name.  

| Param | Description |
| --- | --- |
| key | The name of the state variable. |

<a name="Parser+hook"></a>
#### parser.hook(hook, [segment])
**Kind**: instance method of <code>[Parser](#Parser)</code>  
**Summary**: Add a hook to the parser.  

| Param | Type | Description |
| --- | --- | --- |
| hook | <code>function</code> | The hook to be called after a segment is completed. |
| [segment] | <code>String</code> | The segment triggering this hook. If no segment is provided, the hook will be called after each segment read by the parser. The hook should be a function accepting one argument which the parser will use to pass itself. This allows one to access the current state of the parser. |

<a name="Parser+define"></a>
#### parser.define(definitions, options)
**Kind**: instance method of <code>[Parser](#Parser)</code>  
**Summary**: Define segment and element structures.  

| Param | Type | Description |
| --- | --- | --- |
| definitions | <code>Object</code> | An object containing the definitions. |
| options |  | Set options like the overriding policy. By default the parser accepts any wellformed input if it doesn't find definitinons for the current segment or element being parsed. Additionally the parser can be forced to check the number and format of the elements and components if the right definitions are included. To define a segment or element the definitions object should contain the name as a key, and an object describing it's structure as a value. This object contains the `requires` key to define the number of mandatory elements or components. The key `elements` should be included containing a list of element names to describe a segment. Similarly, an element definition contains a `components` array describing the format of the components. To simplify things, a non-composite element is regarded as an element having only one component. |

<a name="Parser+component"></a>
#### parser.component(input, format, options) ⇒
**Kind**: instance method of <code>[Parser](#Parser)</code>  
**Summary**: Interpret a string according to an EDIFACT format string.  
**Returns**: The input string interpreted with the provided format string.

This method will parse an input string using a format string. If succesful
it will return the input using an appropriate type, otherwise it will throw
an error.  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | The component string to parse. |
| format | <code>String</code> | The format string to parse the input string. |
| options | <code>Object</code> | Options to use (like a custom decimal mark). |

<a name="Parser+parse"></a>
#### parser.parse(input, options)
**Kind**: instance method of <code>[Parser](#Parser)</code>  
**Summary**: Parse a UN/EDIFACT document.  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | The input document. |
| options | <code>Object</code> | Any options to use. |

<a name="Reader"></a>
### Reader ⇐ <code>[Parser](#Parser)</code>
The Reader class provides an easy to use parsing interface to convert
UN/EDIFACT documents to an array of javascript objects, representing the
segments in the original document.

If a message type is provided in the UNH segment, it will try to validate the
message using an appropriate segment table, if the parser can find one.

**Kind**: global class  
**Extends:** <code>[Parser](#Parser)</code>  

* [Reader](#Reader) ⇐ <code>[Parser](#Parser)</code>
  * [.push(segment, elements)](#Reader+push)
  * [.reset()](#Parser+reset)
  * [.state(key)](#Parser+state) ⇒
  * [.hook(hook, [segment])](#Parser+hook)
  * [.define(definitions, options)](#Parser+define)
  * [.component(input, format, options)](#Parser+component) ⇒
  * [.parse(input, options)](#Parser+parse)

<a name="Reader+push"></a>
#### reader.push(segment, elements)
**Kind**: instance method of <code>[Reader](#Reader)</code>  
**Summary**: Push a segment to the parse result.  

| Param | Type | Description |
| --- | --- | --- |
| segment | <code>String</code> | The segment code. |
| elements | <code>Array</code> | A list of elements passed along with the segment. |

<a name="Parser+reset"></a>
#### reader.reset()
**Kind**: instance method of <code>[Reader](#Reader)</code>  
**Summary**: Reset the parser to it&#x27;s initial state.  
**Overrides:** <code>[reset](#Parser+reset)</code>  
<a name="Parser+state"></a>
#### reader.state(key) ⇒
**Kind**: instance method of <code>[Reader](#Reader)</code>  
**Summary**: Request a state variable.  
**Returns**: The state associated with the provided name.  

| Param | Description |
| --- | --- |
| key | The name of the state variable. |

<a name="Parser+hook"></a>
#### reader.hook(hook, [segment])
**Kind**: instance method of <code>[Reader](#Reader)</code>  
**Summary**: Add a hook to the parser.  

| Param | Type | Description |
| --- | --- | --- |
| hook | <code>function</code> | The hook to be called after a segment is completed. |
| [segment] | <code>String</code> | The segment triggering this hook. If no segment is provided, the hook will be called after each segment read by the parser. The hook should be a function accepting one argument which the parser will use to pass itself. This allows one to access the current state of the parser. |

<a name="Parser+define"></a>
#### reader.define(definitions, options)
**Kind**: instance method of <code>[Reader](#Reader)</code>  
**Summary**: Define segment and element structures.  

| Param | Type | Description |
| --- | --- | --- |
| definitions | <code>Object</code> | An object containing the definitions. |
| options |  | Set options like the overriding policy. By default the parser accepts any wellformed input if it doesn't find definitinons for the current segment or element being parsed. Additionally the parser can be forced to check the number and format of the elements and components if the right definitions are included. To define a segment or element the definitions object should contain the name as a key, and an object describing it's structure as a value. This object contains the `requires` key to define the number of mandatory elements or components. The key `elements` should be included containing a list of element names to describe a segment. Similarly, an element definition contains a `components` array describing the format of the components. To simplify things, a non-composite element is regarded as an element having only one component. |

<a name="Parser+component"></a>
#### reader.component(input, format, options) ⇒
**Kind**: instance method of <code>[Reader](#Reader)</code>  
**Summary**: Interpret a string according to an EDIFACT format string.  
**Returns**: The input string interpreted with the provided format string.

This method will parse an input string using a format string. If succesful
it will return the input using an appropriate type, otherwise it will throw
an error.  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | The component string to parse. |
| format | <code>String</code> | The format string to parse the input string. |
| options | <code>Object</code> | Options to use (like a custom decimal mark). |

<a name="Parser+parse"></a>
#### reader.parse(input, options)
**Kind**: instance method of <code>[Reader](#Reader)</code>  
**Summary**: Parse a UN/EDIFACT document.  
**Overrides:** <code>[parse](#Parser+parse)</code>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | The input document. |
| options | <code>Object</code> | Any options to use. |

<a name="Tracker"></a>
### Tracker
A utility class which validates segment order against a given message
structure.

**Kind**: global class  

* [Tracker](#Tracker)
  * [new Tracker(table)](#new_Tracker_new)
  * [.accept(segment)](#Tracker+accept)

<a name="new_Tracker_new"></a>
#### new Tracker(table)

| Param | Type | Description |
| --- | --- | --- |
| table | <code>Array</code> | The segment table to track against. |

<a name="Tracker+accept"></a>
#### tracker.accept(segment)
**Kind**: instance method of <code>[Tracker](#Tracker)</code>  
**Summary**: Match a segment to the message structure and update the current
position of the tracker.  
**Throws**:

- <code>Error</code> Throws if a mandatory segment was omitted.
- <code>Error</code> Throws if unidentified segments are encountered.
- <code>Error</code> Throws if a segment is repeated too much.


| Param | Type | Description |
| --- | --- | --- |
| segment | <code>String</code> | The segment name. |

