"use strict";

/**
 * @description A class to simplify bit-style options. Inspired by Discord.js
 */

class BitField {

    constructor(value=this.constructor.DEFAULT_VALUE) {

        /**
         * @description The bitfield value
         * @type {number}
         */

        this.value;

        this.resolve(value);
    }

    /**
     * @returns {string} The binary string of the bitfield value
     */

    get binary() { return this.constructor.toBinary(this.value); }

    /**
     * @returns {number[]} The binary bits of the bitfield value
     */

    get bytes() { return this.binary.split("").map(a => Number(a)); }

    /**
     * @returns {Object<number, boolean>} The bits represented by an object
     */

    get bitObject() {
        return this.bytes.reverse().reduce((v, a, i) => {
            let bit = 1 << i;
            v[bit] = this.has(bit);
            return v;
        }, {});
    }

    /**
     * @description Adds bits to the current bitfield value
     * @param {...number} bits The bits
     */

    add(...bits) {
        for (const bit of bits) {
            this.value |= bit;
        }
        return this;
    }

    /**
     * @description Removes bits from the current bitfield value
     * @param {...number} bits The bits
     */

    remove(...bits) {
        for (const bit of bits) {
            this.value = (this.value | bit) ^ bit;
        }
        return this;
    }
    
    /**
     * @param {...number} bits The bits
     * @returns {boolean} Whether the entered value can be found within the instance's value
     */

    has(...bits) { return bits.every(bit => (this.value & bit) === bit); }

    /**
     * @description Sets the bitfield value to its default value
     */

    reset() { this.value = this.constructor.DEFAULT_VALUE; return this; }

    /**
     * @description Performs adjustments based on an entered bit representation
     * * `NUMBER` - bit value
     * * `STRING` - binary
     * * `OBJECT` - number, boolean paired bit object representation
     * @param {number|string|(Object<number, boolean>)} bit
     */

    resolve(bit) {
        switch(typeof bit) {

            case "string": { this.resolveBytes(...bit); break; }
            case "number": { this.value = bit; break; }
            
            default: {
                if (Object.prototype.toString(bit) === "[object Object]")
                    this.resolveBitObject(bit);
                if (Array.isArray(bit))
                    this.resolveBytes(...bit);
                break;
            }

        }
        return this;
    }

    /**
     * @description Performs adjustments based on an entered bit and bit value
     * @param {number} bit 
     * @param {boolean} value
     */

    resolveBytes(...bits) {
        bits.reverse().forEach((bit, i) => {
            this.resolveBitBoolean(1 << i, bit);
        });
        return this;
    }

    /**
     * @description Performs adjustments based on an entered bit and bit value
     * @param {number} bit 
     * @param {boolean|number|string} value
     */

    resolveBitBoolean(bit, value) {
        switch(value) {
            default: return this;
            case false:
                case "0":
                case 0: return this.remove(bit);
            case true:
                case "1":
                case 1: return this.add(bit);
        }
    }

    /**
     * @description Performs adjustments based on an entered bit-representative object
     * @param {Object<number, boolean>} obj 
     */
    
    resolveBitObject(obj) {
        for (const [bit, v] of Object.entries(obj)) {
            this.resolveBitBoolean(bit, v);
        }
        return this;
    }

    /**
     * @description Creates and returns an object of (indicator, boolean) pairs
     * @param {Object<string, number>} [obj] The indicator, bit pair object
     * @returns {Object<string, boolean>}
     */
    
    indications(obj=this.constructor.INDICATORS) {
        return Object.entries(obj).reduce((v, [indicator, bit]) => {
            v[indicator] = this.has(bit);
            return v;
        }, {});
    }

    /**
     * @description Performs adjustments based on an indicator (indicator, boolean) object
     * @param {Object<string, boolean>} objBools The indicator, boolean pair object
     * @param {Object<string, number>} [objBits] The indicator, bit pair object
     * @returns {Object<string, boolean>}
     */
    
    resolveIndications(objBools, objBits=this.constructor.INDICATORS) {
        for (const [indicator, bitValue] of Object.entries(obj)) {
            if (indicator in objBits)
                this.resolveBitBoolean(objBits[indicator], bitValue);
        }
        return this;
    }

}

/**
 * @description The default value of the bitfield
 * @type {number}
 */

BitField.DEFAULT_VALUE = 0;

/**
 * @description The (indicator, bit) pair object
 * @type {Object<string, number>}
 */

BitField.INDICATORS = {};

/**
 * @description The value to be converted to a binary string
 * @param {number} value The value
 * @returns {string}
 */

BitField.toBinary = function(value) {
    return (value << 0).toString(2);
};

module.exports = BitField;
