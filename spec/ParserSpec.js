'use strict'

import {Parser} from "../edifact.js";

describe('Parser.write', function () {
  let parser;
  beforeEach(function() {
    parser = new Parser();
    expect(parser.write).toEqual(jasmine.any(Function));
    expect(parser.close).toEqual(jasmine.any(Function));
  });
  it('should accept a valid UNA header', function () {
    expect(function() { parser.write('UNA:+.? \''); }).not.toThrow();
    expect(function() { parser.close(); }).not.toThrow();
  });
  it('should accept an empty segment', function () {
    expect(function() { parser.write('SEG\''); }).not.toThrow();
    expect(function() { parser.close(); }).not.toThrow();
  });
  it('shouldn\'t accept an empty segment without a terminator', function () {
    expect(function() { parser.write('SEG'); }).not.toThrow();
    expect(function() { parser.close(); }).toThrow();
  });
  it('should call hooks after every segment', function () {
    let hook = jasmine.createSpy('hook');
    parser.hook(hook);
    parser.write('UNH\'\nSEG\'');
    expect(hook.calls.count()).toEqual(2);
  });
  it('should call segment hooks when the segment is encountered', function () {
    let hook = jasmine.createSpy('segment hook');
    parser.hook(hook, 'SEG');
    parser.write('SEG\'');
    expect(hook).toHaveBeenCalled();
  });
  it('shouldn\'t call segment hooks when the segment is not encountered', function () {
    let hook = jasmine.createSpy('segment hook');
    parser.hook(hook, 'UNH');
    parser.write('SEG\'');
    expect(hook).not.toHaveBeenCalled();
  });
});

/*describe('Parser.component', function () {
  let parser;
  beforeEach(function() {
    parser = new Parser();
  });
  describe('using the a3 format', function() {
    it('should accept abc', function () {
      expect(parser.component('abc', 'a3')).toEqual('abc');
    });
    it('should not accept ab', function () {
      expect(function () { parser.component('ab', 'a3') }).toThrow();
    });
    it('should not accept abcd', function () {
      expect(function () { parser.component('abcd', 'a3') }).toThrow();
    });
    it('should not accept ab3', function () {
      expect(function () { parser.component('ab3', 'a3') }).toThrow();
    });
  });
  describe('using the an3 format', function() {
    it('should accept abc', function () {
      expect(parser.component('abc', 'an3')).toEqual('abc');
    });
    it('should not accept ab', function () {
      expect(function () { parser.component('ab', 'an3') }).toThrow();
    });
    it('should not accept abcd', function () {
      expect(function () { parser.component('abcd', 'an3') }).toThrow();
    });
    it('should accept ab3', function () {
      expect(parser.component('ab3', 'an3')).toEqual('ab3');
    });
  });
  describe('using the n3 format', function() {
    it('should accept 123', function () {
      expect(parser.component('123', 'n3')).toEqual(123);
    });
    it('should accept 12.3', function () {
      expect(parser.component('12.3', 'n3')).toEqual(12.3);
    });
    it('should not accept abc', function () {
      expect(function () { parser.component('abc', 'n3') }).toThrow();
    });
    it('should not accept 123c', function () {
      expect(function () { parser.component('123c', 'n3') }).toThrow();
    });
    it('should not accept 12', function () {
      expect(function () { parser.component('12', 'n3') }).toThrow();
    });
    it('should not accept 1234', function () {
      expect(function () { parser.component('1234', 'n3') }).toThrow();
    });
  });
});*/
