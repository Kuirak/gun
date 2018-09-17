/*
* @prettier
*/
import { isBoolean, isText, isNumber, isObject } from '@gun/type';

export const isValue = (value: any) => {
  // if(value === u) { return false } // ? What is u
  if (value === null) {
    return true;
  }
  if (value === Infinity) {
    return false;
  }
  if (isText(value) || isBoolean(value) || isNumber(value)) {
    return true;
  }
  return isLink(value) || false;
};

export const LinkKey = '#';

export interface Link {
  [LinkKey]: Soul;
}

export type Soul = string;

export const isLink = (value: any): Soul | false => {
  if (value && value[LinkKey] && !value._ && isObject(value)) {
    if (Object.keys(value).length > 1) {
      return false;
    }
    return value[LinkKey];
  }
  return false; // the value was not a valid soul relation.
};

export const toLink = (soul: Soul) => ({ [LinkKey]: soul });