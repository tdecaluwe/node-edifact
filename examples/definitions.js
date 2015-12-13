'use strict'

let edifact = require('../edifact.js');

let parser = new edifact.Parser();

let document = '';

document += 'UNB+UNOA:1+005435656:1+006415160:1+060515:1434+00000000000778\'\n';
document += 'UNH+00000000000117+INVOIC:D:97B:UN\'\n';
document += 'BGM+380+342459+9\'\n';
document += 'DTM+3:20060515:102\'\n';
document += 'RFF+ON:521052\'\n';
document += 'NAD+BY+792820524::16++CUMMINS MID-RANGE ENGINE PLANT\'\n';
document += 'NAD+SE+005435656::16++GENERAL WIDGET COMPANY\'\n';
document += 'CUX+1:USD\'\n';
document += 'LIN+1++157870:IN\'\n';
document += 'IMD+F++:::WIDGET\'\n';
document += 'QTY+47:1020:EA\'\n';
document += 'ALI+US\'\n';
document += 'MOA+203:1202.58\'\n';
document += 'PRI+INV:1.179\'\n';
document += 'LIN+2++157871:IN\'\n';
document += 'IMD+F++:::DIFFERENT WIDGET\'\n';
document += 'QTY+47:20:EA\'\n';
document += 'ALI+JP\'\n';
document += 'MOA+203:410\'\n';
document += 'PRI+INV:20.5\'\n';
document += 'UNS+S\'\n';
document += 'MOA+39:2137.58\'\n';
document += 'ALC+C+ABG\'\n';
document += 'MOA+8:525\'\n';
document += 'UNT+23+00000000000117\'\n';
document += 'UNZ+1+00000000000778\'\n';

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
