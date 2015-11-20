'use strict'

import {Reader} from "../edifact.js";

describe('Reader.parse', function () {
  let reader;
  beforeEach(function() {
    reader = new Reader();
  });
  it('should return the document as a javascript array', function () {
    let array;
    array = reader.parse('SEG+a::b++c\'');
    expect(array.length).toEqual(1);
    expect(array[0].name).toEqual('SEG');
    expect(array[0].elements.length).toEqual(3);
    expect(array[0].elements).toEqual([['a','','b'], [''], ['c']]);
  });
});
