/*
* @prettier
*/
import { soulify, getSoul, Node } from './node';
import { LinkKey } from './value';

describe('Soulify', () => {
  it('should return a random soul when nothing is provided', () => {
    const node = soulify();
    expect(node).toHaveProperty('_');
    expect(node._).toHaveProperty(LinkKey);
    expect(node._[LinkKey]).toHaveLength(24); // default Value of random Text
  });
  it('should replace existing Link with new soul', () => {
    const node = soulify({ _: { [LinkKey]: 'asdf' }, nodeKey: 'exists' }, 'fdsa');
    expect(node._[LinkKey]).toBe('fdsa');
    expect(node.nodeKey).toBe('exists');
  });
  it('should not change anything with existing Link', () => {
    const node = { _: { [LinkKey]: 'asdf' }, nodeKey: 'exists' };
    expect(soulify(node)).toBe(node);
    expect(soulify(node)._[LinkKey]).toBe('asdf');
    expect(soulify(node).nodeKey).toBe('exists');
  });
  it('should fill missing Soul with a random one', () => {
    const node = soulify({ _: {}, nodeKey: 'exists' });
    expect(node).toHaveProperty('_');
    expect(node._).toHaveProperty(LinkKey);
    expect(node._[LinkKey]).toHaveLength(24);
    expect(node.nodeKey).toBe('exists');
  });
  it('should fill missing Meta with a random one', () => {
    const node = soulify({ nodeKey: 'exists' });
    expect(node).toHaveProperty('_');
    expect(node._).toHaveProperty(LinkKey);
    expect(node._[LinkKey]).toHaveLength(24);
    expect(node.nodeKey).toBe('exists');
  });
});

describe('getSoul', () => {
  it('should return Soul when exists', () => {
    const node = { _: { [LinkKey]: 'asdf' } };
    expect(getSoul(node)).toBeDefined();
    expect(getSoul(node)).toBe('asdf');
  });
  it('should return undefined when not exists', () => {
    const node = { _: {} };
    expect(getSoul(node)).toBeUndefined();
  });
});
