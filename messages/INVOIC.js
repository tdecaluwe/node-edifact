'use strict'

let order = [
  { segment: 'UNH', required: true, repetition: 1, data: ['INVOIC'] },
  { segment: 'BGM', required: true, repetition: 1 },
  { segment: 'DTM', required: true, repetition: 35 },
  { segment: 'PAI', required: false, repetition: 1 },
  { segment: 'ALI', required: false, repetition: 5 },
  { segment: 'IMD', required: false, repetition: 1 },
  { segment: 'FTX', required: false, repetition: 99 },
  { segment: 'LOC', required: false, repetition: 10 },
  { segment: 'GEI', required: false, repetition: 10 },
  { segment: 'DGS', required: false, repetition: 1 },
  { segment: 'GIR', required: false, repetition: 10 },
  {
    segment: [
      { segment: 'RFF', required: true, repetition: 1 },
      { segment: 'DTM', required: false, repetition: 5 },
      { segment: 'GIR', required: false, repetition: 5 },
      { segment: 'LOC', required: false, repetition: 2 },
      { segment: 'MEA', required: false, repetition: 5 },
      { segment: 'QTY', required: false, repetition: 2 },
      { segment: 'FTX', required: false, repetition: 5 },
      { segment: 'MOA', required: false, repetition: 2 },
      { segment: 'RTE', required: false, repetition: 99 },
    ], required: false, repetition: 99999,
  },
  {
    segment: [
      { segment: 'NAD', required: true, repetition: 1 },
      { segment: 'LOC', required: false, repetition: 25 },
      { segment: 'FII', required: false, repetition: 5 },
      { segment: 'MOA', required: false, repetition: 99 },
      {
        segment: [
          { segment: 'RFF', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 9999,
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
      { segment: 'LOC', required: false, repetition: 5 },
    ], required: false, repetition: 5,
  },
  {
    segment: [
      { segment: 'CUX', required: true, repetition: 1 },
      { segment: 'DTM', required: false, repetition: 5 },
    ], required: false, repetition: 99,
  },
  {
    segment: [
      { segment: 'PYT', required: true, repetition: 1 },
      { segment: 'DTM', required: false, repetition: 5 },
      { segment: 'PCD', required: false, repetition: 1 },
      { segment: 'MOA', required: false, repetition: 1 },
      { segment: 'PAI', required: false, repetition: 1 },
      { segment: 'FII', required: false, repetition: 1 },
    ], required: false, repetition: 10,
  },
  {
    segment: [
      { segment: 'TDT', required: true, repetition: 1 },
      { segment: 'TSR', required: false, repetition: 1 },
      {
        segment: [
          { segment: 'LOC', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 10,
      },
      {
        segment: [
          { segment: 'RFF', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 9999,
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
      { segment: 'SEL', required: false, repetition: 9 },
    ], required: false, repetition: 99,
  },
  {
    segment: [
      { segment: 'PAC', required: true, repetition: 1 },
      { segment: 'MEA', required: false, repetition: 5 },
      { segment: 'EQD', required: false, repetition: 1 },
      {
        segment: [
          { segment: 'PCI', required: true, repetition: 1 },
          { segment: 'RFF', required: false, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
          { segment: 'GIN', required: false, repetition: 5 },
        ], required: false, repetition: 5,
      },
    ], required: false, repetition: 1000,
  },
  {
    segment: [
      { segment: 'ALC', required: true, repetition: 1 },
      { segment: 'ALI', required: false, repetition: 5 },
      { segment: 'FTX', required: false, repetition: 1 },
      {
        segment: [
          { segment: 'RFF', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 5,
      },
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
          { segment: 'CUX', required: false, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 1 },
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
    ], required: false, repetition: 9999,
  },
  {
    segment: [
      { segment: 'RCS', required: true, repetition: 1 },
      { segment: 'RFF', required: false, repetition: 5 },
      { segment: 'DTM', required: false, repetition: 5 },
      { segment: 'FTX', required: false, repetition: 5 },
    ], required: false, repetition: 100,
  },
  {
    segment: [
      { segment: 'AJT', required: true, repetition: 1 },
      { segment: 'FTX', required: false, repetition: 5 },
    ], required: false, repetition: 1,
  },
  {
    segment: [
      { segment: 'INP', required: true, repetition: 1 },
      { segment: 'FTX', required: false, repetition: 5 },
    ], required: false, repetition: 1,
  },
  {
    segment: [
      { segment: 'EFI', required: true, repetition: 1 },
      { segment: 'CED', required: false, repetition: 99 },
      { segment: 'COM', required: false, repetition: 9 },
      { segment: 'RFF', required: false, repetition: 9 },
      { segment: 'DTM', required: false, repetition: 9 },
      { segment: 'QTY', required: false, repetition: 9 },
    ], required: false, repetition: 99,
  },
  {
    segment: [
      { segment: 'LIN', required: true, repetition: 1 },
      { segment: 'PIA', required: false, repetition: 25 },
      { segment: 'PGI', required: false, repetition: 99 },
      { segment: 'IMD', required: false, repetition: 99 },
      { segment: 'MEA', required: false, repetition: 5 },
      { segment: 'QTY', required: false, repetition: 5 },
      { segment: 'PCD', required: false, repetition: 1 },
      { segment: 'ALI', required: false, repetition: 5 },
      { segment: 'DTM', required: false, repetition: 35 },
      { segment: 'GIN', required: false, repetition: 1000 },
      { segment: 'GIR', required: false, repetition: 1000 },
      { segment: 'QVR', required: false, repetition: 1 },
      { segment: 'EQD', required: false, repetition: 1 },
      { segment: 'FTX', required: false, repetition: 99 },
      { segment: 'DGS', required: false, repetition: 1 },
      {
        segment: [
          { segment: 'MOA', required: true, repetition: 1 },
          { segment: 'CUX', required: false, repetition: 1 },
        ], required: false, repetition: 99,
      },
      {
        segment: [
          { segment: 'PYT', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
          { segment: 'PCD', required: false, repetition: 99 },
          { segment: 'MOA', required: false, repetition: 1 },
        ], required: false, repetition: 10,
      },
      {
        segment: [
          { segment: 'PRI', required: true, repetition: 1 },
          { segment: 'CUX', required: false, repetition: 1 },
          { segment: 'APR', required: false, repetition: 1 },
          { segment: 'RNG', required: false, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 25,
      },
      {
        segment: [
          { segment: 'RFF', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 10,
      },
      {
        segment: [
          { segment: 'PAC', required: true, repetition: 1 },
          { segment: 'MEA', required: false, repetition: 10 },
          { segment: 'EQD', required: false, repetition: 1 },
          {
            segment: [
              { segment: 'PCI', required: true, repetition: 1 },
              { segment: 'RFF', required: false, repetition: 1 },
              { segment: 'DTM', required: false, repetition: 5 },
              { segment: 'GIN', required: false, repetition: 10 },
            ], required: false, repetition: 10,
          },
        ], required: false, repetition: 999,
      },
      {
        segment: [
          { segment: 'LOC', required: true, repetition: 1 },
          { segment: 'QTY', required: false, repetition: 100 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 9999,
      },
      {
        segment: [
          { segment: 'TAX', required: true, repetition: 1 },
          { segment: 'MOA', required: false, repetition: 2 },
          { segment: 'LOC', required: false, repetition: 5 },
        ], required: false, repetition: 99,
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
        ], required: false, repetition: 99,
      },
      {
        segment: [
          { segment: 'ALC', required: true, repetition: 1 },
          { segment: 'ALI', required: false, repetition: 5 },
          { segment: 'DTM', required: false, repetition: 5 },
          { segment: 'FTX', required: false, repetition: 1 },
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
              { segment: 'CUX', required: false, repetition: 1 },
              { segment: 'DTM', required: false, repetition: 1 },
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
        ], required: false, repetition: 30,
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
          { segment: 'RCS', required: true, repetition: 1 },
          { segment: 'RFF', required: false, repetition: 5 },
          { segment: 'DTM', required: false, repetition: 5 },
          { segment: 'FTX', required: false, repetition: 5 },
        ], required: false, repetition: 100,
      },
      {
        segment: [
          { segment: 'GEI', required: true, repetition: 1 },
          { segment: 'RFF', required: false, repetition: 9 },
          { segment: 'IMD', required: false, repetition: 99 },
          { segment: 'DTM', required: false, repetition: 5 },
          { segment: 'GIR', required: false, repetition: 5 },
          { segment: 'LOC', required: false, repetition: 2 },
          { segment: 'MEA', required: false, repetition: 5 },
          { segment: 'QTY', required: false, repetition: 9 },
          { segment: 'FTX', required: false, repetition: 5 },
          { segment: 'MOA', required: false, repetition: 2 },
        ], required: false, repetition: 999,
      },
      {
        segment: [
          { segment: 'EFI', required: true, repetition: 1 },
          { segment: 'CED', required: false, repetition: 99 },
          { segment: 'COM', required: false, repetition: 9 },
          { segment: 'RFF', required: false, repetition: 9 },
          { segment: 'DTM', required: false, repetition: 9 },
          { segment: 'QTY', required: false, repetition: 9 },
        ], required: false, repetition: 99,
      },
    ],
  },
  { segment: 'UNS', required: true, repetition: 1 },
  { segment: 'CNT', required: false, repetition: 10 },
  {
    segment: [
      { segment: 'MOA', required: true, repetition: 1 },
      {
        segment: [
          { segment: 'RFF', required: true, repetition: 1 },
          { segment: 'DTM', required: false, repetition: 5 },
        ], required: false, repetition: 1,
      },
    ], required: false, repetition: 100,
  },
  {
    segment: [
      { segment: 'TAX', required: true, repetition: 1 },
      { segment: 'MOA', required: false, repetition: 9 },
    ], required: false, repetition: 10,
  },
  {
    segment: [
      { segment: 'ALC', required: true, repetition: 1 },
      { segment: 'ALI', required: false, repetition: 1 },
      { segment: 'MOA', required: false, repetition: 2 },
      { segment: 'FTX', required: false, repetition: 1 },
    ], required: false, repetition: 10,
  },
  { segment: 'UNT', required: true, repetition: 1 },
];

module.exports = order;
