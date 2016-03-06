'use strict'

let Parser = require('../parser.js');

describe('Parser.write', function () {
  let parser;
  let counter;
  beforeEach(function() {
    parser = new Parser();
    expect(parser.write).toEqual(jasmine.any(Function));
    expect(parser.end).toEqual(jasmine.any(Function));
  });
  it('should accept a valid UNA header', function () {
    expect(function() { parser.write('UNA:+.? \''); }).not.toThrow();
    expect(function() { parser.end(); }).not.toThrow();
  });
  it('should use special characters as defined in the UNA header', function () {
    parser.write('UNA+:.? ;');
    expect(function() { parser.write('SEG:+:;'); }).not.toThrow();
    expect(function() { parser.end(); }).not.toThrow();
  });
  it('should accept an empty segment', function () {
    expect(function() { parser.write('SEG\''); }).not.toThrow();
    expect(function() { parser.end(); }).not.toThrow();
  });
  it('shouldn\'t accept an empty segment without a terminator', function () {
    expect(function() { parser.write('SEG'); }).not.toThrow();
    expect(function() { parser.end(); }).toThrow();
  });
  it('should call onopensegment when starting a new segment', function () {
    let hook = jasmine.createSpy('hook');
    parser.onopensegment = hook;
    parser.write('UNH');
    expect(hook.calls.count()).toEqual(0);
    parser.write('+');
    expect(hook.calls.count()).toEqual(1);
    parser.write('\'\nSEG');
    expect(hook.calls.count()).toEqual(1);
    parser.write('\'');
    expect(hook.calls.count()).toEqual(2);
  });
  it('should call onclosesegment when terminating a segment', function () {
    let hook = jasmine.createSpy('hook');
    parser.onclosesegment = hook;
    parser.write('UNH+');
    expect(hook.calls.count()).toEqual(0);
    parser.write('\'');
    expect(hook.calls.count()).toEqual(1);
  });
  it('should call onelement when finishing an new element', function () {
    let hook = jasmine.createSpy('hook');
    parser.onelement = hook;
    parser.write('UNH');
    expect(hook.calls.count()).toEqual(0);
    parser.write('++');
    expect(hook.calls.count()).toEqual(1);
    parser.write('\'');
    expect(hook.calls.count()).toEqual(2);
  });
  it('should call onelement when finishing an new component', function () {
    let hook = jasmine.createSpy('hook');
    parser.oncomponent = hook;
    parser.write('UNH+');
    expect(hook.calls.count()).toEqual(0);
    parser.write(':');
    expect(hook.calls.count()).toEqual(1);
    parser.write('\'');
    expect(hook.calls.count()).toEqual(2);
  });
  it('should read characters preceded by the release character as data', function () {
    let component;
    parser.oncomponent = function (data) { component = data; };
    parser.write('SEG+??\'');
    expect(component).toEqual('?');
  });
});
