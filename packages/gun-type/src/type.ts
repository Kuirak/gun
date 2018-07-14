/*
 * @prettier
 */

export const isFunction = (fn: any): fn is Function => !!fn && 'function' == typeof fn;

export const isBoolean = (bool: any): bool is boolean => bool instanceof Boolean || typeof bool == 'boolean';

export const isNumber = (num: any): num is number =>
  !isList(num) && (num - parseFloat(num) + 1 >= 0 || Infinity === num || -Infinity === num);

export const isText = (text: any): text is string => typeof text == 'string';

// * JSON supported since IE8: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#Browser_compatibility
export const textify = (text: string | any): string => (isText(text) ? text : JSON.stringify(text));

const defaultChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
export const randomText = (length: number = 24, characters: string = defaultChars): string => {
  let s = '';
  while (length > 0) {
    s += characters.charAt(Math.floor(Math.random() * characters.length));
    length--;
  }
  return s;
};

// * isArray supported since IE9: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Browser_compatibility
export const isList = Array.isArray;

// TODO export const mapList = (l, c, _) => mapObject(l, c, _);

// ? Not sure if Object is correct
export const isObject = (
  obj: any
): Object => // ? Not sure if Object is correct
  obj
    ? (obj instanceof Object && obj.constructor === Object) ||
      Object.prototype.toString.call(obj).match(/^\[object (\w+)\]$/)[1] === 'Object'
    : false;

export const putInObject = (obj: object, key: string | number | symbol, value: any): object => (
  ((obj || {})[key] = value), obj
);

export const objectHas = (obj: object, key: string | number | symbol) =>
  obj && Object.prototype.hasOwnProperty.call(obj, key);

export const deleteFromObject = (obj: object, key: string | number | symbol) => {
  if (!obj) {
    return;
  }
  obj[key] = null;
  delete obj[key];
  return obj;
};

const isNullOrUndefined = (arg: any): arg is undefined | null => arg == null;

// ! as o.O
export const getKeyWhenExists = <T, K extends keyof T, D>(
  obj: T,
  key: K,
  defaultValue: D,
  compareValue: D
): T[K] | D | {} => {
  if (isNullOrUndefined(obj[key])) {
    return compareValue === defaultValue ? {} : defaultValue;
  }
  return obj[key];
};

export const objectify = (obj: any) => {
  if (isObject(obj)) {
    return obj;
  }
  try {
    return JSON.parse(obj);
  } catch {
    return {};
  }
};

// because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
// is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
export const copyObject = (obj: any)=> 	 !obj? obj : JSON.parse(JSON.stringify(obj))
