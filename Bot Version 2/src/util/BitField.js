"use strict";

/**
 * @description A class to simplify bit-style options. Inspired by Discord.js
 */

class BitField {

    constructor(value, defaultValue=this.constructor.DEFAULT_VALUE) {

        /**
         * @description The bitfield value
         * @type {number}
         */

        this.value = defaultValue;

        /**
         * @description The default bitfield value
         * @type {number}
         */

        this.defaultValue = defaultValue;

        this.resolve(value);
    }

    /**
     * @returns {Object<string, number>} The indicator bits
     */

    get indicators() { return this.constructor.INDICATORS; }

    /**
     * @returns {Object<string, number>} The bases bits
     */

    get bases() { return this.constructor.BASES; }

    /**
     * @returns {Object<string, number>} The flexable bits
     */

    get flexes() { return this.constructor.FLEXES; }

    /**
     * @returns {string} The binary string of the bitfield value
     */

    get binary() { return this.value.toString(2); }

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
     * @description Adds bits to the current bitfield
     * @param {...number} bits The bits
     */

    add(...bits) {
        for (const bit of bits) {
            this.value |= bit;
        }
        return this;
    }

    /**
     * @description Removes a set a bits from the bitfield then adds certain ones in its place
     * @param {number} baseBit The values to look at for flexing
     * @param {number} flexBit The values to flex
     */

    flex(baseBit, flexBit) {
        if (!((baseBit | flexBit) === baseBit))
            throw new Error(`flexBit, ${flexBit} (${flexBit.toString(2)}), is out of range of the baseBit, ${baseBit} (${baseBit.toString(2)})`);
        this.remove(baseBit);
        this.add(flexBit);
        return this;
    }

    /**
     * @description Removes bits from the current bitfield
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
     * @returns {boolean} Whether the entered bits can be found within the instance's value
     */

    has(...bits) { return bits.every(bit => (this.value & bit) === bit); }
    
    /**
     * @param {...number} bits The bits
     * @returns {boolean} Whether at least one of the entered bits can be found within the instance's value
     */

    hasOne(...bits) { return bits.some(bit => (this.value & bit) === bit); }

    /**
     * @param {number} baseBit The values to look at for flexing
     * @param {...number} flexBit The values to flex
     * @returns {boolean} Whether the baseBits are flexing the entered flexBits
     */

    hasFlex(baseBit, ...flexBit) {
        return flexBit.every((bit, i) => {
            if (!((baseBit | bit) === baseBit))
                throw new Error(`index ${i}'s flexBit, ${bit} (${bit.toString(2)}), is out of range of the baseBit, ${baseBit} (${baseBit.toString(2)})`);
            return (this.value & baseBit) === bit;
        });
    }

    /**
     * @param {number} baseBit The values to look at for flexing
     * @param {...number} flexBit The values to flex
     * @returns {boolean} Whether the baseBits are flexing at least one of the entered flexBits
     */

    hasFlexOne(baseBit, ...flexBit) {
        return flexBit.some((bit, i) => {
            if (!((baseBit | bit) === baseBit))
                throw new Error(`index ${i}'s flexBit, ${bit} (${bit.toString(2)}), is out of range of the baseBit, ${baseBit} (${baseBit.toString(2)})`);
            return (this.value & baseBit) === bit;
        });
    }

    /**
     * @description Sets the bitfield value to its default value
     */

    reset() { this.resolve(this.defaultValue); return this; }

    /**
     * @description Performs adjustments based on an entered bit representation
     * * `NUMBER` - bit value
     * * `STRING` - binary
     * * `OBJECT` - number, boolean paired bit object representation
     * @param {number|string|(Object<number, boolean>)} bit
     */

    resolve(bit) {
        if (bit instanceof BitField)
            this.resolve(bit.value);
        else if (typeof bit === "undefined")
            this.reset();
        else if (typeof bit === "number")
            this.value = bit;
        else if (typeof bit === "string")
            this.resolveBytes(...bit);
        else if (Object.prototype.toString.call(bit) === "[object Object]" && Object.keys(bit).every(k => /^[0-9]{1,}$/.test(k)))
            this.resolveBitObject(bit);
        else if (Array.isArray(bit))
            this.resolveBytes(...bit);
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
    
    indicatorsObj(obj=this.constructor.INDICATORS) {
        return Object.entries(obj).reduce((v, [indicator, bit]) => {
            v[indicator] = this.has(bit);
            return v;
        }, {});
    }

    /**
     * @description Creates and returns an object of (base, bit) pairs where bit is the flexed bit
     * @param {Object<string, number>} [obj] The base, bit pair object
     * @returns {Object<string, number>}
     */
    
    basesObj(obj=this.constructor.BASES) {
        return Object.entries(obj).reduce((v, [base, bit]) => {
            v[base] = this.value & bit;
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
        for (const [indicator, bitValue] of Object.entries(objBools)) {
            if (indicator in objBits)
                this.resolveBitBoolean(objBits[indicator], bitValue);
        }
        return this;
    }

    /**
     * @description Disables everything, setting the bitfield value to the defaultValue
     */

    disable() { return this.resolve(0); }

    /**
     * @description Enalbes everything, setting the bitfield value to the maximum based on the indicators
     */

    enable() { return this.add(...Object.values(this.constructor.INDICATORS)); }

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
 * @description The (base, bit) pair object
 * @type {Object<string, number>}
 */

BitField.BASES = {};

/**
 * @description The (flex, bit) pair object
 * @type {Object<string, number>}
 */

BitField.FLEXES = {};

module.exports = BitField;
