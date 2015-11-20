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
};

module.exports = segments;
