"use strict";

/**
 * @description A customizable version of the "Switch" structure
 * that supports strings, numbers, BigInts, booleans, functions, and RegExps
 * @extends {Array}
 */

class SwitchCustom extends Array {

    constructor(defaultValue, ...entries) {
        super();

        /**
         * @description The value to return for a failed switch
         * @type {*}
         */

        this.defaultValue = defaultValue;

        this.registerEntries(...entries);
    }

    /**
     * @description The switching function
     * @param {*} keyValue the value to compare
     * @param {*} [defaultValue=this.defaultValue] the value to return for a failed switch
     * @returns {*} The value that was switched for
     */

    switch(keyValue, defaultValue=this.defaultValue) {
        return this.reduce((v, [a, b]) => {
            if (!v.matched) {
                if ([ "string", "number", "bigint", "boolean" ].includes(typeof a) && typeof a === typeof keyValue)
                    { if (a === keyValue) return { value: b, matched: true }; }
                else if (typeof a === "function")
                    { if (a(keyValue) === true) return { value: b, matched: true}; }
                else if (a instanceof RegExp && [ "string", "number", "bigint", "boolean" ].includes(typeof b))
                    { if (a.test(keyValue)) return { value: b, matched: true }; }
            }
            return v;
        }, { value: defaultValue, matched: false }).value;
    }

    /**
     * @description Attempts to add a [key, value] entry else produces an error
     * @param {key: string | number | BigInt | boolean | (() => boolean) | RegExp, value: ?*} key the value to be compared to
     * @param {*} value the value to return in the switch
     */

    register(key, value) {
        if (!([
            "string", "number", "bigint", "boolean", "function"
        ].includes(typeof key) || key instanceof RegExp))
            throw new Error(`Entry key has an invalid type (${typeof key}). Acceptable types are: strings, numbers, BigInts, booleans, functions, and regular expressions`);
        this.push([key, value]);
        return this;
    }

    /**
     * @description Attempts to add [key, value] entries else produces an error
     * @param {...[key: string | number | BigInt | boolean | (() => boolean) | RegExp, value: ?*]} entries
     */

    registerEntries(...entries) {
        entries.forEach((entry, i) => {
            if (!Array.isArray(entry))
                throw new Error(`Entry at index ${i} is not in an array format`);
            if (![1, 2].includes(entry.length))
                throw new Error(`Entry at index ${i} has an invalid length (${entry.length}). Must be 1 or 2`);
            try { this.register(...entry); }
            catch { throw new Error(`Entry at index ${i} has an invalid type (${typeof key}). Acceptable types are: strings, numbers, BigInts, booleans, functions, and regular expressions`); }
        });
        return this;
    }

}

module.exports = SwitchCustom;
