'use strict'

let order = [
  { segment: 'UNH', required: true, repetition: 1, data: ['ORDERS'] },
  { segment: 'BGM', required: true, repetition: 1 },
  { segment: 'DTM', required: true, repetition: 35 },
  { segment: 'PAI', required: false, repetition: 1 },
  { segment: 'ALI', required: false, repetition: 5 },
  { segment: 'IMD', required: false, repetition: 999 },
  { segment: 'FTX', required: false, repetition: 99 },
  { segment: 'GIR', required: false, repetition: 10 },
  {
    segment: [
      { segment: 'RFF', required: true, repetition: 1 },
      { segment: 'DTM', required: false, repetition: 5 },
    ], required: false, repetition: 9999,
  },
  {
    segment: [
      { segment: 'NAD', required: true, repetition: 1 },
      { segment: 'LOC', required: false, repetition: 99 },
      { segment: 'FII', required: false, repetition: 5 },
      {
        segment: [
          { segment: 'RFF', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 99,
      },
      {
        segment: [
          { segment: 'DOC', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 5,
      },
      {
        segment: [
          { segment: 'CTA', required: true, repetition: 1 },
          { segment: 'COM', required: false, repetition: 5 },
        ], required: false, repetition: 5,
      },
    ], required: false, repetition: 99,
  },
  {
    segment: [
      { segment: 'TAX', required: true, repetition: 1 },
      { segment: 'MOA', required: false, repetition: 1 },
      { segment: 'LOC', required: false, repetition: 9 },
    ], required: false, repetition: 5,
  },
  {
    segment: [
      { segment: 'CUX', required: true, repetition: 1 },
      { segment: 'PCD', required: false, repetition: 5 },
      { segment: 'DTM', required: false, repetition: 5 },
    ], required: false, repetition: 5,
  },
  {
    segment: [
      { segment: 'PYT', required: true, repetition: 1 },
      { segment: 'DTM', required: false, repetition: 5 },
      { segment: 'PCD', required: false, repetition: 1 },
      {
        segment: [
          { segment: 'MOA', required: true, repetition: 1 },
          { segment: 'GIR', required: false, repetition: 9 },
          { segment: 'RJL', required: false, repetition: 99 },
        ], required: false, repetition: 9999,
      },
    ], required: false, repetition: 10,
  },
  {
    segment: [
      { segment: 'TDT', required: true, repetition: 1 },
      {
        segment: [
          { segment: 'LOC', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 10,
      },
    ], required: false, repetition: 10,
  },
  {
    segment: [
      { segment: 'TOD', required: true, repetition: 1 },
      { segment: 'LOC', required: false, repetition: 2 },
    ], required: false, repetition: 5,
  },
  {
    segment: [
      { segment: 'PAC', required: true, repetition: 1 },
      { segment: 'MEA', required: false, repetition: 5 },
      {
        segment: [
          { segment: 'PCI', required: true, repetition: 1 },
          { segment: 'RFF', required: false, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
          { segment: 'GIN', required: false, repetition: 10 },
        ], required: false, repetition: 5,
      },
    ], required: false, repetition: 99,
  },
  {
    segment: [
      { segment: 'EQD', required: true, repetition: 1 },
      { segment: 'HAN', required: false, repetition: 5 },
      { segment: 'MEA', required: false, repetition: 5 },
      { segment: 'FTX', required: false, repetition: 5 },
    ], required: false, repetition: 10,
  },
  {
    segment: [
      { segment: 'SCC', required: true, repetition: 1 },
      { segment: 'FTX', required: false, repetition: 5 },
      { segment: 'RFF', required: false, repetition: 5 },
      {
        segment: [
          { segment: 'QTY', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 10,
      },
    ], required: false, repetition: 10,
  },
  {
    segment: [
      { segment: 'APR', required: true, repetition: 1 },
      { segment: 'DTM', required: false, repetition: 5 },
      { segment: 'RNG', required: false, repetition: 1 },
    ], required: false, repetition: 25,
  },
  {
    segment: [
      { segment: 'ALC', required: true, repetition: 1 },
      { segment: 'ALI', required: false, repetition: 5 },
      { segment: 'DTM', required: false, repetition: 5 },
      {
        segment: [
          { segment: 'QTY', required: true, repetition: 1 },
          { segment: 'RNG', required: false, repetition: 1 },
        ], required: false, repetition: 1,
      },
      {
        segment: [
          { segment: 'PCD', required: true, repetition: 1 },
          { segment: 'RNG', required: false, repetition: 1 },
        ], required: false, repetition: 1,
      },
      {
        segment: [
          { segment: 'MOA', required: true, repetition: 1 },
          { segment: 'RNG', required: false, repetition: 1 },
        ], required: false, repetition: 1,
      },
      {
        segment: [
          { segment: 'RTE', required: true, repetition: 1 },
          { segment: 'RNG', required: false, repetition: 1 },
        ], required: false, repetition: 2,
      },
      {
        segment: [
          { segment: 'TAX', required: true, repetition: 1 },
          { segment: 'MOA', required: false, repetition: 1 },
        ], required: false, repetition: 5,
      },
    ], required: false, repetition: 99,
  },
  {
    segment: [
      { segment: 'RCS', required: true, repetition: 1 },
      { segment: 'RFF', required: false, repetition: 5 },
      { segment: 'DTM', required: false, repetition: 5 },
      { segment: 'FTX', required: false, repetition: 99999 },
    ], required: false, repetition: 999,
  },
  {
    segment: [
      { segment: 'DGS', required: true, repetition: 1 },
      { segment: 'FTX', required: false, repetition: 5 },
      {
        segment: [
          { segment: 'CTA', required: true, repetition: 1 },
          { segment: 'COM', required: false, repetition: 5 },
        ], required: false, repetition: 99,
      },
    ], required: false, repetition: 999,
  },
  {
    segment: [
      { segment: 'LIN', required: true, repetition: 1 },
      { segment: 'PIA', required: false, repetition: 25 },
      { segment: 'IMD', required: false, repetition: 99 },
      { segment: 'MEA', required: false, repetition: 99 },
      { segment: 'QTY', required: false, repetition: 99 },
      { segment: 'PCD', required: false, repetition: 5 },
      { segment: 'ALI', required: false, repetition: 5 },
      { segment: 'DTM', required: false, repetition: 35 },
      { segment: 'MOA', required: false, repetition: 10 },
      { segment: 'GEI', required: false, repetition: 99 },
      { segment: 'GIN', required: false, repetition: 1000 },
      { segment: 'GIR', required: false, repetition: 1000 },
      { segment: 'QVR', required: false, repetition: 1 },
      { segment: 'DOC', required: false, repetition: 99 },
      { segment: 'PAI', required: false, repetition: 1 },
      { segment: 'MTD', required: false, repetition: 99 },
      { segment: 'FTX', required: false, repetition: 99 },
      {
        segment: [
          { segment: 'CCI', required: true, repetition: 1 },
          { segment: 'CAV', required: false, repetition: 10 },
          { segment: 'MEA', required: false, repetition: 10 },
        ], required: false, repetition: 999,
      },
      {
        segment: [
          { segment: 'PYT', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
          { segment: 'PCD', required: false, repetition: 1 },
          {
            segment: [
              { segment: 'MOA', required: true, repetition: 1 },
              { segment: 'GIR', required: false, repetition: 9 },
            ], required: false, repetition: 9999,
          },
        ], required: false, repetition: 10,
      },
      {
        segment: [
          { segment: 'PRI', required: true, repetition: 1 },
          { segment: 'CUX', required: false, repetition: 1 },
          { segment: 'APR', required: false, repetition: 99 },
          { segment: 'RNG', required: false, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 25,
      },
      {
        segment: [
          { segment: 'RFF', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
          { segment: 'GEI', required: false, repetition: 99 },
          { segment: 'MOA', required: false, repetition: 99 },
        ], required: false, repetition: 9999,
      },
      {
        segment: [
          { segment: 'PAC', required: true, repetition: 1 },
          { segment: 'MEA', required: false, repetition: 5 },
          { segment: 'QTY', required: false, repetition: 5 },
          { segment: 'DTM', required: false, repetition: 5 },
          {
            segment: [
              { segment: 'RFF', required: true, repetition: 1 },
              { segment: 'DTM', required: false, repetition: 5 },
            ], required: false, repetition: 1,
          },
          {
            segment: [
              { segment: 'PCI', required: true, repetition: 1 },
              { segment: 'RFF', required: false, repetition: 1 },
              { segment: 'DTM', required: false, repetition: 5 },
              { segment: 'GIN', required: false, repetition: 10 },
            ], required: false, repetition: 5,
          },
        ], required: false, repetition: 99,
      },
      {
        segment: [
          { segment: 'LOC', required: true, repetition: 1 },
          { segment: 'QTY', required: false, repetition: 1 },
          { segment: 'PCD', required: false, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 9999,
      },
      {
        segment: [
          { segment: 'TAX', required: true, repetition: 1 },
          { segment: 'MOA', required: false, repetition: 1 },
          { segment: 'LOC', required: false, repetition: 5 },
        ], required: false, repetition: 10,
      },
      {
        segment: [
          { segment: 'NAD', required: true, repetition: 1 },
          { segment: 'LOC', required: false, repetition: 5 },
          { segment: 'FII', required: false, repetition: 5 },
          {
            segment: [
              { segment: 'RFF', required: true, repetition: 1 },
              { segment: 'DTM', required: false, repetition: 5 },
            ], required: false, repetition: 99,
          },
          {
            segment: [
              { segment: 'DOC', required: true, repetition: 1 },
              { segment: 'DTM', required: false, repetition: 5 },
            ], required: false, repetition: 5,
          },
          {
            segment: [
              { segment: 'CTA', required: true, repetition: 1 },
              { segment: 'COM', required: false, repetition: 5 },
            ], required: false, repetition: 5,
          },
        ], required: false, repetition: 999,
      },
      {
        segment: [
          { segment: 'ALC', required: true, repetition: 1 },
          { segment: 'ALI', required: false, repetition: 5 },
          { segment: 'DTM', required: false, repetition: 5 },
          {
            segment: [
              { segment: 'QTY', required: true, repetition: 1 },
              { segment: 'RNG', required: false, repetition: 1 },
            ], required: false, repetition: 1,
          },
          {
            segment: [
              { segment: 'PCD', required: true, repetition: 1 },
              { segment: 'RNG', required: false, repetition: 1 },
            ], required: false, repetition: 1,
          },
          {
            segment: [
              { segment: 'MOA', required: true, repetition: 1 },
              { segment: 'RNG', required: false, repetition: 1 },
            ], required: false, repetition: 2,
          },
          {
            segment: [
              { segment: 'RTE', required: true, repetition: 1 },
              { segment: 'RNG', required: false, repetition: 1 },
            ], required: false, repetition: 1,
          },
          {
            segment: [
              { segment: 'TAX', required: true, repetition: 1 },
              { segment: 'MOA', required: false, repetition: 1 },
            ], required: false, repetition: 5,
          },
        ], required: false, repetition: 99,
      },
      {
        segment: [
          { segment: 'TDT', required: true, repetition: 1 },
          {
            segment: [
              { segment: 'LOC', required: true, repetition: 1 },
              { segment: 'DTM', required: false, repetition: 5 },
            ], required: false, repetition: 10,
          },
        ], required: false, repetition: 10,
      },
      {
        segment: [
          { segment: 'TOD', required: true, repetition: 1 },
          { segment: 'LOC', required: false, repetition: 2 },
        ], required: false, repetition: 5,
      },
      {
        segment: [
          { segment: 'EQD', required: true, repetition: 1 },
          { segment: 'HAN', required: false, repetition: 5 },
          { segment: 'MEA', required: false, repetition: 5 },
          { segment: 'FTX', required: false, repetition: 5 },
        ], required: false, repetition: 10,
      },
      {
        segment: [
          { segment: 'SCC', required: true, repetition: 1 },
          { segment: 'FTX', required: false, repetition: 5 },
          { segment: 'RFF', required: false, repetition: 5 },
          {
            segment: [
              { segment: 'QTY', required: true, repetition: 1 },
              { segment: 'DTM', required: false, repetition: 5 },
            ], required: false, repetition: 10,
          },
        ], required: false, repetition: 100,
      },
      {
        segment: [
          { segment: 'RCS', required: true, repetition: 1 },
          { segment: 'RFF', required: false, repetition: 5 },
          { segment: 'DTM', required: false, repetition: 5 },
          { segment: 'FTX', required: false, repetition: 99999 },
        ], required: false, repetition: 999,
      },
      {
        segment: [
          { segment: 'STG', required: true, repetition: 1 },
          {
            segment: [
              { segment: 'QTY', required: true, repetition: 1 },
              { segment: 'MOA', required: false, repetition: 1 },
            ], required: false, repetition: 3,
          }
        ], required: false, repetition: 10,
      },
      {
        segment: [
          { segment: 'DGS', required: true, repetition: 1 },
          { segment: 'FTX', required: false, repetition: 5 },
          {
            segment: [
              { segment: 'CTA', required: true, repetition: 1 },
              { segment: 'COM', required: false, repetition: 5 },
            ], required: false, repetition: 99,
          },
        ], required: false, repetition: 999,
      },
    ],
  },
  { segment: 'UNS', required: true, repetition: 1 },
  { segment: 'MOA', required: false, repetition: 99 },
  { segment: 'CNT', required: false, repetition: 10 },
  {
    segment: [
      { segment: 'ALC', required: true, repetition: 1 },
      { segment: 'ALI', required: false, repetition: 1 },
      { segment: 'MOA', required: true, repetition: 2 },
    ], required: false, repetition: 10,
  },
  { segment: 'UNT', required: true, repetition: 1 },
];

module.exports = order;
