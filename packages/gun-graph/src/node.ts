/*
* @prettier
*/

import { LinkKey, Soul, Link } from './value';
import { randomText, isText } from '@gun/type';

type Node = {
  _: Link;
  [K: string]: string | number | boolean | Link;
};

export const soulify = (node: Partial<Node> = {}, soul?: Soul) => {
  if (!node._) {
    node._ = { [LinkKey]: soul || randomText() };
  } else if (soul) {
    node._[LinkKey] = soul;
  } else if (!node._[LinkKey]) {
    node._[LinkKey] = randomText();
  }
  return node;
};

export const hasSoul = (node: Partial<Node>): Soul | undefined => node && node._ && node._[LinkKey];
