'use strict'

let edifact = require('../index.js');

let validator = new edifact.Validator();
let parser = new edifact.Parser(validator);

validator.define(require('../segments.js'));
validator.define(require('../elements.js'));

let document = '';

document += 'UNB+UNOA:1+005435656:1+006415160:1+060515:1434+00000000000778\'';
document += 'UNH+00000000000117+INV\n\rOIC:D:97B:UN\'';
document += 'BGM+380+342459+9\'';
document += 'DTM+3:20060515:102\'';
document += 'RFF+ON:521052\'';
document += 'NAD+BY+792820524::16++CUMMINS MID-RANGE ENGINE PLANT\'';
document += 'NAD+SE+005435656::16++GENERAL WIDGET COMPANY\'';
document += 'CUX+1:USD\'';
document += 'LIN+1++157870:IN\'';
document += 'IMD+F++:::WIDGET\'';
document += 'QTY+47:1020:EA\'';
document += 'ALI+US\'';
document += 'MOA+203:1202.58\'';
document += 'PRI+INV:1.179\'';
document += 'LIN+2++157871:IN\'';
document += 'IMD+F++:::DIFFERENT WIDGET\'';
document += 'QTY+47:20:EA\'';
document += 'ALI+JP\'';
document += 'MOA+203:410\'';
document += 'PRI+INV:20.5\'';
document += 'UNS+S\'';
document += 'MOA+39:2137.58\'';
document += 'ALC+C+ABG\'';
document += 'MOA+8:525\'';
document += 'UNT+23+00000000000117\'';
document += 'UNZ+1+00000000000778\'';

let result;
let elements;
let components;

parser.onopensegment = function (segment) {
  elements = [];
  result.push({ name: segment, elements: elements });
}

parser.onelement = function () {
  components = [];
  elements.push(components);
}

parser.oncomponent = function (value) {
  components.push(value);
}

result = [];
parser.write(document);

for (let i = 0; i < result.length; i++) {
  console.log(result[i].name + ': ' + result[i].elements);
}
