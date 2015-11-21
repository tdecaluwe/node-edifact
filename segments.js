'use strict'

let segments = {
  'BGM': { requires: 0, elements: ['C002', 'C106', '1225', '4343'] },
  'UNH': { requires: 2, elements: ['0065', '0052', '0054', '0051', '0057', '0110'] },
  'DTM': { requires: 1, elements: ['C507'] },
  'PAI': { requires: 1, elements: ['C534'] },
  'ALI': { requires: 0, elements: ['3239', '9213', '4183', '4183', '4183', '4183', '4183'] },
  'IMD': { requires: 0, elements: ['7077', 'C272', 'C273', '7383'] },
  'FTX': { requires: 1, elements: ['4451', '4453', 'C107', 'C108', '3453', '4447'] },
  'GIR': { requires: 2, elements: ['7297', 'C206', 'C206', 'C206', 'C206', 'C206'] },
  'RFF': { requires: 1, elements: ['C506'] },
  'NAD': { requires: 1, elements: ['3035', 'C082', 'C058', 'C080', 'C059', '3164', 'C819', '3251', '3207'] },
  'CUX': { requires: 0, elements: ['C504', 'C504', '5402', '6341'] },
  'LIN': { requires: 0, elements: ['1082', '1229', 'C212', 'C829', '1222', '7083'] },
  'QTY': { requires: 1, elements: ['C186'] },
  'MOA': { requires: 1, elements: ['C516'] },
  'PRI': { requires: 0, elements: ['C509', '5213'] },
  'UNS': { requires: 1, elements: ['0081'] },
  'LAC': { requires: 1, elements: ['5463', 'C552', '4471', '1227', 'C214'] },
  'UNT': { requires: 2, elements: ['0074', '0062'] },
  'UNZ': { requires: 2, elements: ['0036', '0020'] },
};

module.exports = segments;
