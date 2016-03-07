/**
 * @author Tom De Caluwé
 * @copyright 2016 Tom De Caluwé
 * @license Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

var segments = {
  'ALI': { requires: 0, elements: ['3239', '9213', '4183', '4183', '4183', '4183', '4183'] },
  'BGM': { requires: 0, elements: ['C002', 'C106', '1225', '4343', '1373', '3453'] },
  'CED': { requires: 2, elements: ['1501', 'C079', '9448'] },
  'CNT': { requires: 1, elements: ['C270'] },
  'COD': { requires: 0, elements: ['C823', 'C824'] },
  'COM': { requires: 1, elements: ['C076'] },
  'CPS': { requires: 1, elements: ['7164', '7166', '7075'] },
  'CTA': { requires: 0, elements: ['3139', 'C056'] },
  'CUX': { requires: 0, elements: ['C504', 'C504', '5402', '6341'] },
  'DGS': { requires: 0, elements: ['8273', 'C205', 'C234', 'C223', '8339', '8364', '8410', '8126', 'C235', 'C236', '8255', '8179', '8211', 'C289'] },
  'DLM': { requires: 0, elements: ['4455', 'C522', 'C214', '4457'] },
  'DTM': { requires: 1, elements: ['C507'] },
  'EFI': { requires: 1, elements: ['C077', 'C099', '1050', '9450'] },
  'ERC': { requires: 1, elements: ['C901'] },
  'EQA': { requires: 1, elements: ['8053', 'C237'] },
  'EQD': { requires: 1, elements: ['8053', 'C237', 'C224', '8077', '8249', '8169'] },
  'FTX': { requires: 1, elements: ['4451', '4453', 'C107', 'C108', '3453', '4447'] },
  'GIN': { requires: 2, elements: ['7405', 'C208', 'C208', 'C208', 'C208', 'C208'] },
  'GIR': { requires: 2, elements: ['7297', 'C206', 'C206', 'C206', 'C206', 'C206'] },
  'HAN': { requires: 0, elements: ['C524', 'C218'] },
  'IMD': { requires: 0, elements: ['7077', 'C272', 'C273', '7383'] },
  'LAC': { requires: 1, elements: ['5463', 'C552', '4471', '1227', 'C214'] },
  'LIN': { requires: 0, elements: ['1082', '1229', 'C212', 'C829', '1222', '7083'] },
  'LOC': { requires: 1, elements: ['3227', 'C519', 'C553', '5479'] },
  'MEA': { requires: 1, elements: ['6311', 'C502', 'C174', '7383'] },
  'MOA': { requires: 1, elements: ['C516'] },
  'NAD': { requires: 1, elements: ['3035', 'C082', 'C058', 'C080', 'C059', '3164', 'C819', '3251', '3207'] },
  'PAC': { requires: 0, elements: ['7224', 'C531', 'C202', 'C402', 'C532'] },
  'PAI': { requires: 1, elements: ['C534'] },
  'PCD': { requires: 1, elements: ['C501', '4405'] },
  'PCI': { requires: 0, elements: ['4233', 'C210', '8275', 'C827'] },
  'PIA': { requires: 2, elements: ['4347', 'C212', 'C212', 'C212', 'C212', 'C212'] },
  'PRI': { requires: 0, elements: ['C509', '5213'] },
  'QTY': { requires: 1, elements: ['C186'] },
  'QVR': { requires: 0, elements: ['C279', '4221', 'C960'] },
  'RFF': { requires: 1, elements: ['C506'] },
  'SEL': { requires: 0, elements: ['9308', 'C215', '4517', 'C208'] },
  'SGP': { requires: 1, elements: ['C237', '7224'] },
  'TDT': { requires: 1, elements: ['8051', '8028', 'C220', 'C228', 'C040', '8101', 'C401', 'C222', '8281'] },
  'TMD': { requires: 0, elements: ['C219', '8332', '8341'] },
  'TOD': { requires: 0, elements: ['4055', '4215', 'C100'] },
  'UNH': { requires: 2, elements: ['0065', '0052', '0054', '0051', '0057', '0110'] },
  'UNS': { requires: 1, elements: ['0081'] },
  'UNT': { requires: 2, elements: ['0074', '0062'] },
  'UNZ': { requires: 2, elements: ['0036', '0020'] }
};

module.exports = segments;
