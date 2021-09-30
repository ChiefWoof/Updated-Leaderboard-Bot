"use strict";

/**
 * @description A class to simplify bit-style options. Inspired by Discord.js
 */

class BitField {

    constructor(value=BitField.DEFAULT_VALUE) {

        /**
         * @description The bitfield value
         * @type {number}
         */

        this.value = value;

    }

    /**
     * @returns {string} The binary string of the bitfield value
     */

    get binary() { return (this.value << 0).toString(2); }

    /**
     * @description Adds a bitfield value to the current bitfield value
     * @param {number} value 
     */

    add(value) { this.value = this.value | value; return this; }

    /**
     * @description Removes a bitfield value from the current bitfield value
     * @param {number} value 
     */

    remove(value) { this.value = (this.value | value) ^ value; return this; }
    
    /**
     * @param {number} value bitfield value 
     * @returns {boolean} Whether the entered value can be found within the instance's value
     */

    has(value) { return (this.value & value) === value; }

    /**
     * @description Sets the bitfield value to its default value
     */

    reset() { this.value = BitField.DEFAULT_VALUE; return this; }

}

/**
 * @description The default value of the bitfield
 * @type {number}
 */

BitField.DEFAULT_VALUE = 0;

module.exports = BitField;
