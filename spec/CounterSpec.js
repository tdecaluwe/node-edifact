'use strict'

let Counter = require('../counter.js');

describe('Counter', function () {
  let counter;
  beforeEach(function () {
    counter = new Counter();
  });
  it('should report the correct number of segments seen', function () {
    expect(counter.counts.segment).toEqual(0);
    counter.onopensegment('AAA');
    counter.onclosesegment();
    expect(counter.counts.segment).toEqual(1);
    counter.onopensegment('BBB');
    counter.onclosesegment();
    expect(counter.counts.segment).toEqual(2);
  });
  it('should report the correct number of elements seen', function () {
    expect(counter.counts.element).toEqual(0);
    counter.onelement();
    expect(counter.counts.element).toEqual(1);
    counter.onelement();
    expect(counter.counts.element).toEqual(2);
  });
  it('should report the correct number of components seen', function () {
    expect(counter.counts.component).toEqual(0);
    counter.onopencomponent();
    counter.onclosecomponent();
    expect(counter.counts.component).toEqual(1);
    counter.onopencomponent();
    counter.onclosecomponent();
    expect(counter.counts.component).toEqual(2);
  });
});
