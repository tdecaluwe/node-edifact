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

### Performance

A significant performance improvement was included in the 1.0 release, resulting in a threefold increase in parsing speed. Parsing speed including validation but without matching against a segment table is around 20Mbps. Around 30% of the time spent seems to be needed for the validation part.
## Reference

### Classes

<dl>
<dt><a href="#Counter">Counter</a></dt>
<dd><p>The <code>Counter</code> class can be used as a validator for the <code>Parser</code> class.
However it doesn&#39;t perform any validation, it only keeps track of segment,
element and component counts. Component counts are reset when starting a new
element, just like element counts are reset when closing the segment.</p>
</dd>
<dt><a href="#Parser">Parser</a></dt>
<dd><p>The <code>Parser</code> class encapsulates an online parsing algorithm, similar to a
SAX-parser. By itself it doesn&#39;t do anything useful, however several
callbacks can be provided for different parsing events.</p>
</dd>
<dt><a href="#Reader">Reader</a></dt>
<dd><p>The <code>Reader</code> class is included for backwards compatibility. It translates an
UN/EDIFACT document to an array of segments. Each segment has a <code>name</code> and
<code>elements</code> property where <code>elements</code> is an array consisting of component
arrays. The class exposes a <code>parse()</code> method which accepts the document as a
string.</p>
</dd>
<dt><a href="#Tracker">Tracker</a></dt>
<dd><p>A utility class which validates segment order against a given message
structure.</p>
</dd>
<dt><a href="#Validator">Validator</a></dt>
<dd><p>The <code>Validator</code> can be used as an add-on to <code>Parser</code> class, to enable
validation of segments, elements and components. This class implements a
tolerant validator, only segments and elemens for which definitions are
provided will be validated. Other segments or elements will pass through
untouched. Validation includes:</p>
<ul>
<li>Checking data element counts, including mandatory elements.</li>
<li>Checking component counts, including mandatory components.</li>
<li>Checking components against they&#39;re required format.</li>
</ul>
</dd>
</dl>

<a name="Counter"></a>
### Counter
The `Counter` class can be used as a validator for the `Parser` class.
However it doesn't perform any validation, it only keeps track of segment,
element and component counts. Component counts are reset when starting a new
element, just like element counts are reset when closing the segment.

**Kind**: global class  
<a name="Parser"></a>
### Parser
The `Parser` class encapsulates an online parsing algorithm, similar to a
SAX-parser. By itself it doesn't do anything useful, however several
callbacks can be provided for different parsing events.

**Kind**: global class  

* [Parser](#Parser)
    * [new Parser([validator])](#new_Parser_new)
    * [.close()](#Parser+close)
    * [.write(chunk)](#Parser+write)

<a name="new_Parser_new"></a>
#### new Parser([validator])

| Param | Type | Description |
| --- | --- | --- |
| [validator] | <code>[Validator](#Validator)</code> | Accepts a validator class for handling data validation. |

<a name="Parser+close"></a>
#### parser.close()
**Kind**: instance method of <code>[Parser](#Parser)</code>  
**Summary**: Ends the EDI interchange.  
**Throws**:

- <code>Error</code> If more data is expected.

<a name="Parser+write"></a>
#### parser.write(chunk)
**Kind**: instance method of <code>[Parser](#Parser)</code>  
**Summary**: Write some data to the parser.  

| Param | Type | Description |
| --- | --- | --- |
| chunk | <code>String</code> | A chunk of UN/EDIFACT data. |

<a name="Reader"></a>
### Reader
The `Reader` class is included for backwards compatibility. It translates an
UN/EDIFACT document to an array of segments. Each segment has a `name` and
`elements` property where `elements` is an array consisting of component
arrays. The class exposes a `parse()` method which accepts the document as a
string.

**Kind**: global class  

* [Reader](#Reader)
    * [.define(definitions)](#Reader+define)
    * [.parse(document)](#Reader+parse) ⇒ <code>Array</code>

<a name="Reader+define"></a>
#### reader.define(definitions)
Provide the underlying `Validator` with segment or element definitions.

**Kind**: instance method of <code>[Reader](#Reader)</code>  
**Summary**: Define segment and element structures.  

| Param | Type | Description |
| --- | --- | --- |
| definitions | <code>Object</code> | An object containing the definitions. |

<a name="Reader+parse"></a>
#### reader.parse(document) ⇒ <code>Array</code>
**Kind**: instance method of <code>[Reader](#Reader)</code>  
**Summary**: Parse a UN/EDIFACT document  
**Returns**: <code>Array</code> - An array of segment objects.  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>String</code> | The input document. |

<a name="Tracker"></a>
### Tracker
A utility class which validates segment order against a given message
structure.

**Kind**: global class  

* [Tracker](#Tracker)
    * [new Tracker(table)](#new_Tracker_new)
    * [.advance()](#Tracker+advance)
    * [.accept(segment)](#Tracker+accept)

<a name="new_Tracker_new"></a>
#### new Tracker(table)

| Param | Type | Description |
| --- | --- | --- |
| table | <code>Array</code> | The segment table to track against. |

<a name="Tracker+advance"></a>
#### tracker.advance()
**Kind**: instance method of <code>[Tracker](#Tracker)</code>  
**Summary**: Advance the tracker to the next segment in the table.  
**Throws**:

- <code>Error</code> Throws when the end of the segment table is reached.

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

<a name="Validator"></a>
### Validator
The `Validator` can be used as an add-on to `Parser` class, to enable
validation of segments, elements and components. This class implements a
tolerant validator, only segments and elemens for which definitions are
provided will be validated. Other segments or elements will pass through
untouched. Validation includes:
* Checking data element counts, including mandatory elements.
* Checking component counts, including mandatory components.
* Checking components against they're required format.

**Kind**: global class  

* [Validator](#Validator)
    * [.disable()](#Validator+disable)
    * [.enable()](#Validator+enable)
    * [.define(definitions)](#Validator+define)
    * [.format()](#Validator+format) ⇒ <code>Object</code>
    * [.regex()](#Validator+regex) ⇒ <code>RegExp</code>
    * [.onopensegment(segment)](#Validator+onopensegment)
    * [.onelement()](#Validator+onelement)
    * [.oncomponent()](#Validator+oncomponent)
    * [.onclosesegment()](#Validator+onclosesegment)
    * [.ondecimal(character)](#Validator+ondecimal)
    * [.ondata()](#Validator+ondata)
    * [.value()](#Validator+value) ⇒ <code>String</code>

<a name="Validator+disable"></a>
#### validator.disable()
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Disable validation.  
<a name="Validator+enable"></a>
#### validator.enable()
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Enable validation on the next segment.  
<a name="Validator+define"></a>
#### validator.define(definitions)
To define a segment or element the definitions object should contain the
name as a key, and an object describing it's structure as a value. This
object contains the `requires` key to define the number of mandatory
elements or components. The key `elements` should be included containing a
list of element names to describe a segment. Similarly, an element
definition contains a `components` array describing the format of the
components.

To simplify things, a non-composite element is regarded as an element
having only one component.

**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Define segment and element structures.  

| Param | Type | Description |
| --- | --- | --- |
| definitions | <code>Object</code> | An object containing the definitions. |

<a name="Validator+format"></a>
#### validator.format() ⇒ <code>Object</code>
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Request a component definition associated with a format string.  
**Returns**: <code>Object</code> - A component definition.  
<a name="Validator+regex"></a>
#### validator.regex() ⇒ <code>RegExp</code>
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Request a regex usable for accepting component data.  
<a name="Validator+onopensegment"></a>
#### validator.onopensegment(segment)
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Open a new segment.  

| Param | Type | Description |
| --- | --- | --- |
| segment | <code>String</code> | The segment name. |

<a name="Validator+onelement"></a>
#### validator.onelement()
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Start validation for a new element.  
<a name="Validator+oncomponent"></a>
#### validator.oncomponent()
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Start validation for a new component.  
<a name="Validator+onclosesegment"></a>
#### validator.onclosesegment()
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Finish validation for the current segment.  
<a name="Validator+ondecimal"></a>
#### validator.ondecimal(character)
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Read a decimal mark.  
**Throws**:

- <code>Error</code> When the current context doesn't accept a decimal mark.


| Param | Type | Description |
| --- | --- | --- |
| character | <code>String</code> | The character being used as a decimal mark. |

<a name="Validator+ondata"></a>
#### validator.ondata()
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Read some data.  
<a name="Validator+value"></a>
#### validator.value() ⇒ <code>String</code>
**Kind**: instance method of <code>[Validator](#Validator)</code>  
**Summary**: Get the value currently stored in the buffer.  
**Returns**: <code>String</code> - The value in the component buffer.  
**Throws**:

- <code>Error</code> If the buffer doesn't contain a valid component.

