'use strict'

let edifact = require('../edifact.js');
let segments = require('../segments.js');
let elements = require('../elements.js');

let reader = new edifact.Reader;
let document = '';

reader.define(segments);
reader.define(elements);

document += 'UNA:+.? \'\n';
document += 'UNB+IATB:1+6XPPC+LHPPC+940101:0950+1\'\n';
document += 'UNH+1+PAORES:93:1:IA\'\n';
document += 'MSG+1:45\'\n';
document += 'IFT+3+XYZCOMPANY AVAILABILITY\'\n';
document += 'ERC+A7V:1:AMD\'\n';
document += 'IFT+3+NO MORE FLIGHTS\'\n';
document += 'ODI\'\n';
document += 'TVL+240493:1000::1220+FRA+JFK+DL+400+C\'\n';
document += 'PDI++C:3+Y::3+F::1\'\n';
document += 'APD+74C:0:::6++++++6X\'\n';
document += 'TVL+240493:1740::2030+JFK+MIA+DL+081+C\'\n';
document += 'PDI++C:4\'\n';
document += 'APD+EM2:0:1630::6+++++++DA\'\n';
document += 'UNT+13+1\'\n';
document += 'UNZ+1+1\'\n';

let result = reader.parse(document);
for (let i = 0; i < result.length; i++) {
  console.log(result[i].name + ': ' + result[i].elements);
}
