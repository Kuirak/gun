/*
* @prettier
*/

import { Node } from './node';
import { isObject, isBoolean, isText, isFunction } from '@gun/type';
import { isValue, isLink } from './value';

type Graph = Record<string, Node>;

// TODO: export const isGraph = (graph: any): graph is Graph => {};

const getType = (arg: any) => {
  if (isBoolean(arg)) {
    return 'boolean';
  }
  if (isText(arg)) {
    return 'string';
  }
  if (isFunction(arg)) {
    return 'function';
  }
  if (isObject(arg)) {
    return 'object';
  }
};

const toPairs = (obj: any) => {
  if (!isObject(obj)) {
    return [];
  }

  return Object.keys(obj)
    .map((key) => [key, obj[key], getType(obj[key])])
    .filter((it) => it[2] !== 'function');
};

// a.b -> object -> Link -> add to root
// a.primitive -> string | bool | number
const objectToNode = (obj: any) => {
   // foreach  key/value in obj
   // if value is object
   //   
};

const addNodeToGraph = (node: Node, root: Graph): Graph => {};
