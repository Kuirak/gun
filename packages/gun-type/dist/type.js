"use strict";
/*
 * @prettier
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFunction = (fn) => !!fn && 'function' == typeof fn;
exports.isBoolean = (bool) => bool instanceof Boolean || typeof bool == 'boolean';
exports.isNumber = (num) => !exports.isList(num) && (num - parseFloat(num) + 1 >= 0 || Infinity === num || -Infinity === num);
exports.isText = (text) => typeof text == 'string';
// * JSON supported since IE8: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#Browser_compatibility
exports.textify = (text) => (exports.isText(text) ? text : JSON.stringify(text));
const defaultChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
exports.randomText = (length = 24, characters = defaultChars) => {
    let s = '';
    while (length > 0) {
        s += characters.charAt(Math.floor(Math.random() * characters.length));
        length--;
    }
    return s;
};
// * isArray supported since IE9: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Browser_compatibility
exports.isList = Array.isArray;
const mapList = (list, transform) => list.map(transform);
// ? Not sure if Object is correct
exports.isObject = (obj) => // ? Not sure if Object is correct
 obj
    ? (obj instanceof Object && obj.constructor === Object) ||
        Object.prototype.toString.call(obj).match(/^\[object (\w+)\]$/)[1] === 'Object'
    : false;
exports.putInObject = (obj, key, value) => (((obj || {})[key] = value), obj);
exports.objectHas = (obj, key) => obj && Object.prototype.hasOwnProperty.call(obj, key);
exports.deleteFromObject = (obj, key) => {
    if (!obj) {
        return;
    }
    obj[key] = null;
    delete obj[key];
    return obj;
};
exports.isNullOrUndefined = (arg) => arg == null;
// ! as o.O
exports.getKeyWhenExists = (obj, key, defaultValue, compareValue) => {
    if (exports.isNullOrUndefined(obj[key])) {
        return compareValue === defaultValue ? {} : defaultValue;
    }
    return obj[key];
};
exports.objectify = (obj) => {
    if (exports.isObject(obj)) {
        return obj;
    }
    try {
        return JSON.parse(obj);
    }
    catch (_a) {
        return {};
    }
};
// because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
// is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
exports.copyObject = (obj) => (!obj ? obj : JSON.parse(JSON.stringify(obj)));
exports.mapObject = (from, transform) => {
    return Object.keys(from).reduce((newObj, key) => {
        newObj[key] = transform(from[key], key);
        return newObj;
    }, {});
};
