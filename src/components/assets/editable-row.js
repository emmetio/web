'use strict';

/**
 * Creates editable version for given table row (array of values)
 */
export default class EditableRow {
	/**
	 * @param {Array} row
	 */
	constructor(row) {
		this._original = row;
		this._value = row.slice();
		this._errors = row.map(() => null);
	}

	/**
	 * Check if currently edited table row is empty
	 * @returns {Boolean}
	 */
	get empty() {
		return !this._value.some(Boolean);
	}

	/**
	 * Check if any value in row was updated
	 * @return {Boolean}
	 */
	get updated() {
		const items = this._value;

		for (let i = 0; i < items.length; i++) {
			if (items[i] !== this._original[i]) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns current value of cell `cellIx`
	 * @param {Number} cellIx
	 * @return {*}
	 */
	value(cellIx) {
		return this._value[cellIx];
	}

	/**
	 * Returns current error of cell `cellIx`
	 * @param {Number} cellIx
	 * @returns {Error}
	 */
	error(cellIx) {
		return this._errors[cellIx];
	}

	/**
	 * Check if current row contains errors
	 */
	hasError() {
		return this._errors.some(Boolean);
	}

	/**
	 * Updates value of given cell in row
	 * @param {Number} cellIx
	 * @param {*} value
	 * @param {Error} [error]
	 * @return {Boolean}
	 */
	update(cellIx, value, error) {
		if (this._value[cellIx] !== value || this._errors[cellIx] !== error) {
			this._value[cellIx] = value;
			this._errors[cellIx] = error;

			return true;
		}

		return false;
	}
}
