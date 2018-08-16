'use strict'

let Parser = require('../parser.js');

let msg = "UNB+UNOC:3+123:14+123:14+180813:0806+404114++LG'UNH+404114+MSCONS:D:04B:UN:2.1a'";


it('Should accept sample message with two parsers & same encodings (config is cached)', function () {
  let parser1 = new Parser();
  parser1.encoding("UNOY");
  let parser2 = new Parser();
  parser2.encoding("UNOY");
  expect(function() { parser1.write(msg); }).not.toThrow();
  expect(function() { parser1.end(); }).not.toThrow();
  expect(function() { parser2.write(msg); }).not.toThrow();
  expect(function() { parser2.end(); }).not.toThrow();
});
