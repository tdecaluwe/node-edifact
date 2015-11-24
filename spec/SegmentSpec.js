'use strict'

import {Parser} from "../edifact.js";
import * as segments from "../segments.js";
import * as elements from "../elements.js";

describe('Parser.parse', function () {
  let parser;
  beforeEach(function() {
    parser = new Parser();
    parser.define(elements);
    parser.define(segments);
  });
  describe('should only accept conforming segments for segment', function () {
    it('GIN', function () {
      expect(function () { parser.parse('GIN\'') }).toThrow();
      expect(function () { parser.parse('GIN+a\'') }).toThrow();
      expect(function () { parser.parse('GIN+a+a\'') }).not.toThrow();
      expect(function () { parser.parse('GIN+abcd+a\'') }).toThrow();
    });
    it('PAC', function () {
      expect(function () { parser.parse('PAC\'') }).not.toThrow();
      expect(function () { parser.parse('PAC+A\'') }).toThrow();
      expect(function () { parser.parse('PAC++ABCD\'') }).toThrow();
      expect(function () { parser.parse('PAC++:ABCD\'') }).toThrow();
      expect(function () { parser.parse('PAC++::ABCD\'') }).toThrow();
      expect(function () { parser.parse('PAC+++ABCDEFGHIJKLMNOPQR\'') }).toThrow();
      expect(function () { parser.parse('PAC+++:ABCDEFGHIJKLMNOPQR\'') }).toThrow();
      expect(function () { parser.parse('PAC+++::ABCD\'') }).toThrow();
      expect(function () { parser.parse('PAC+++:::ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJ\'') }).toThrow();
      expect(function () { parser.parse('PAC+++++\'') }).toThrow();
      expect(function () { parser.parse('PAC++++:+\'') }).not.toThrow();
      expect(function () { parser.parse('PAC++++:++\'') }).toThrow();
    });
    it('QTY', function () {
      expect(function () { parser.parse('QTY\'') }).toThrow();
      expect(function () { parser.parse('QTY+\'') }).toThrow();
      expect(function () { parser.parse('QTY+:\'') }).not.toThrow();
      expect(function () { parser.parse('QTY+::\'') }).not.toThrow();
      expect(function () { parser.parse('QTY+ABCD:\'') }).toThrow();
      expect(function () { parser.parse('QTY+:ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJ\'') }).toThrow();
      expect(function () { parser.parse('QTY+::ABCD\'') }).toThrow();
    });
  });
});

