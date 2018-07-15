/*
* @prettier
*/

import { LinkKey, Soul, Link, isValue } from './value';
import { randomText, isText, deleteFromObject, isObject, isFunction } from '@gun/type';

export interface Node extends Partial<Record<string, string | number | boolean | Link>> {
  _: Link;
}

type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>
}

export const soulify = (node: DeepPartial<Node> = {}, soul?: Soul): Node => {
  if (!node._) {
    node._ = { [LinkKey]: soul || randomText() };
  } else if (soul) {
    node._[LinkKey] = soul;
  } else if (!node._[LinkKey]) {
    node._[LinkKey] = randomText();
  }
  return node as Node;
};

export const getSoul = (node: DeepPartial<Node>): Soul | undefined => node && node._ && node._[LinkKey];

type MapFunc = (obj, u, node: Partial<Node>) => Node;

interface NodeifyOptions {
  soul: Soul;
  map: MapFunc;
  node: Node;
}

export const nodeify = (obj, soulOrMap?: Soul | MapFunc | Partial<NodeifyOptions>, as?) => {
  const o: Partial<NodeifyOptions> = {};

  if (isText(soulOrMap)) {
    o.soul = soulOrMap;
  } else if (isFunction(soulOrMap)) {
    o.map = soulOrMap;
  } else if (soulOrMap) {
    o.map = soulOrMap.map;
    o.soul = soulOrMap.soul;
    o.node = soulOrMap.node;
  }

  if (o.map) {
    o.node = o.map.call(as, obj, u, o.node || {});
  }
  if ((o.node = soulify(o.node || {}, soulOrMap))) {
    obj_map(obj, map, { o: soulOrMap, as: as });
  }
  return o.node; // This will only be a valid node if the object wasn't already deep!
};
function map(value, key) {
  var o = this.o,
    tmp,
    u; // iterate over each key/value.
  if (o.map) {
    tmp = o.map.call(this.as, value, '' + key, o.node);
    if (u === tmp) {
      deleteFromObject(o.node, key);
    } else if (o.node) {
      o.node[key] = tmp;
    }
    return;
  }
  if (isValue(value)) {
    o.node[key] = value;
  }
}
