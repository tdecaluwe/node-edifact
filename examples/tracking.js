'use strict'

var edifact = require('edifact');
var invoice = require('edifact/messages/INVOIC');

var parser = new edifact.Parser();
var tracker = new edifact.Tracker(invoice);

var document = '';

document += 'UNH+ME000001+INVOIC:D:01B:UN:EAN011\'';
document += 'BGM+380+IN432097\'';
document += 'BGM+380+IN432097\'';
document += 'DTM+137:20020308:102\'';
document += 'PAI+::42\'';
document += 'RFF+ON:ORD9523\'';
document += 'DTM+171:20020212:102\'';
document += 'RFF+PL:PL99523\'';
document += 'DTM+171:20020101:102\'';
document += 'RFF+DQ:53662\'';
document += 'DTM+171:20020215:102\'';
document += 'NAD+BY+5412345000013::9\'';
document += 'RFF+VA:4146023\'';
document += 'NAD+SU+4012345500004::9\'';
document += 'RFF+VA:VR12345\'';
document += 'NAD+DP+5412345678908::9\'';
document += 'CUX+2:EUR:4\'';
document += 'PAT+1++5:3:M:2\'';
document += 'PCD+12:2.5:13\'';
document += 'ALC+C++6++FC\'';
document += 'MOA+23:120\'';
document += 'TAX+7+VAT+++:::19+S\'';
document += 'MOA+124:22.80\'';
document += 'LIN+1++4000862141404:SRV\'';
document += 'QTY+47:40\'';
document += 'MOA+203:2160\'';
document += 'PRI+AAB:60:CA\'';
document += 'TAX+7+VAT+++:::21+S\'';
document += 'MOA+124:453.60\'';
document += 'ALC+A\'';
document += 'PCD+1:10\'';
document += 'LIN+2++5412345111115:SRV\'';
document += 'QTY+46:5\'';
document += 'QTY+47:12.65:KGM\'';
document += 'MOA+203:2530\'';
document += 'PRI+AAA:200:CA::1:KGM\'';
document += 'TAX+7+VAT+++:::19+S\'';
document += 'MOA+124:480.70\'';
document += 'UNS+S\'';
document += 'CNT+2:2\'';
document += 'MOA+86:5767.10\'';
document += 'MOA+79:4690\'';
document += 'MOA+129:5767.10\'';
document += 'MOA+125:4810\'';
document += 'MOA+176:957.10\'';
document += 'MOA+131:120\'';
document += 'TAX+7+VAT+++:::19+S\'';
document += 'MOA+124:503.50\'';
document += 'TAX+7+VAT+++:::21+S\'';
document += 'MOA+124:453.60\'';
document += 'ALC+C++++FC\'';
document += 'MOA+131:120\'';
document += 'UNT+53+ME000001\'';

parser.on('opensegment', function (segment) {
  tracker.accept(segment);
});

tracker.on('error', function (error) {
  console.log(`${error.message} while processing ${this.segment}`);
});

parser.encoding('UNOA');
parser.write(document);
parser.end();