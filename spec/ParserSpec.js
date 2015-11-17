'use strict'

import {Parser} from "../edifact.js";

describe('Parser', function() {
  let parser;
  beforeEach(function() {
    parser = new Parser();
  });
  it('should accept a valid UNA header', function() {
    expect(function() { parser.parse('UNA:+.? \''); }).not.toThrow();
  });
  it('should accept an empty segment', function() {
    expect(function() { parser.parse('SEG\''); }).not.toThrow();
  });
  it('shouldn\'t parse an empty segment without a terminator', function() {
    expect(function() { parser.parse('SEG'); }).toThrow();
  });
});
