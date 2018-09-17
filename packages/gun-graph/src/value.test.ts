/*
* @prettier
*/

import { isLink, isValue, toLink } from './value';

describe('Gun Value Helper', () => {
  it('is value', function() {
    expect(isValue(false)).toBe(true);
    expect(isValue(true)).toBe(true);
    expect(isValue(0)).toBe(true);
    expect(isValue(1)).toBe(true);
    expect(isValue('')).toBe(true);
    expect(isValue('a')).toBe(true);
    expect(isValue({ '#': 'somesoulidhere' })).toBe('somesoulidhere');
    expect(isValue({ '#': 'somesoulidhere', and: 'nope' })).toBe(false);
    expect(isValue(Infinity)).toBe(false); // boohoo :(
    expect(isValue(NaN)).toBe(false);
    expect(isValue([])).toBe(false);
    expect(isValue([1])).toBe(false);
    expect(isValue({})).toBe(false);
    expect(isValue({ a: 1 })).toBe(false);
    expect(isValue(function() {})).toBe(false);
  });

  it('is link', function() {
    expect(isLink({ '#': 'somesoulidhere' })).toBe('somesoulidhere');
    expect(isLink({ '#': 'somethingelsehere' })).toBe('somethingelsehere');
    expect(isLink({ '#': 'somesoulidhere', and: 'nope' })).toBe(false);
    expect(isLink({ or: 'nope', '#': 'somesoulidhere' })).toBe(false);
    expect(isLink(false)).toBe(false);
    expect(isLink(true)).toBe(false);
    expect(isLink('')).toBe(false);
    expect(isLink('a')).toBe(false);
    expect(isLink(0)).toBe(false);
    expect(isLink(1)).toBe(false);
    expect(isLink(Infinity)).toBe(false); // boohoo :(
    expect(isLink(NaN)).toBe(false);
    expect(isLink([])).toBe(false);
    expect(isLink([1])).toBe(false);
    expect(isLink({})).toBe(false);
    expect(isLink({ a: 1 })).toBe(false);
    expect(isLink(function() {})).toBe(false);
  });

  it('converts soul into link', () => {
    expect(toLink('somesoulidhere')).toEqual({ '#': 'somesoulidhere' });
  });
});
