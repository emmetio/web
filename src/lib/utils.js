'use strict';

/**
 * Safe dot-property getter for `obj`: returns value of `obj` by given `key`,
 * separated by `.`, but doesn’t throw error if any of the property key exists
 * @param {Object} obj
 * @param {String|String[]} key
 * @param {*} [defaultValue]
 * @return {*}
 */
export function get(obj, key, defaultValue) {
	let result = obj;
	if (typeof key === 'string') {
		key = key.split('.');
	}

	for (let i = 0; i < key.length; i++) {
		if (result == null) {
			break;
		}

		result = result[key[i]];
	}

	return result != null ? result : defaultValue;
}

/**
 * Stores given `value` in `obj` by nested `key` in immutable fashion: all
 * intermediate objects will be re-created
 * @param {Object} obj
 * @param {String | String[]} key
 * @param {*} value
 * @returns {Object} Updated `obj`
 */
export function set(obj, key, value) {
	if (typeof key === 'string') {
		key = key.split('.');
	}

	if (!key.length || get(obj, key) === value) {
		return obj;
	}

	let ctx = obj = copy(obj);
	for (let i = 0, k; i < key.length - 1; i++) {
		k = key[i];
		ctx = ctx[k] = copy(ctx[k]);
	}

	ctx[key[key.length - 1]] = value;
	return obj;
}

/**
 * Creates a copy of given object
 * @param {Array|Object} obj
 */
function copy(obj) {
	if (obj == null) {
		return {};
	}

	if (Array.isArray(obj)) {
		return obj.slice();
	}

	return { ...obj };
}

/**
 * Check if two given objects are identical
 * @param {Object} a
 * @param {Object} b
 * @returns {Boolean}
 */
export function objectsEqual(a, b) {
	if (!a || !b) {
		return false;
	}

	const keysA = Object.keys(a);
	if (keysA.length !== Object.keys(b).length) {
		return false;
	}

	for (let i = 0, key; i < keysA.length; i++) {
		key = keysA[i];
		if (a[key] !== b[key]) {
			return false;
		}
	}

	return true;
}
