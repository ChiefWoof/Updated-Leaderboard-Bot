"use strict";

const BitField = require("./BitField");

/**
 * @description The RGB color
 * @extends {BitField}
 */

class Color extends BitField {

    /**
     * @description Red
     * @type {number}
     * @param {number} value number inclusively between 0 and 255
     */

    get R() { return (this.value & this.bases.R) >> 16; }
    set R(value) { return this.flex(this.bases.R, value << 16); }

    /**
     * @description Red
     * @type {number}
     * @param {number} value number inclusively between 0 and 255
     */

    get G() { return (this.value & this.bases.G) >> 8 }
    set G(value) { return this.flex(this.bases.G, value << 8); }

    /**
     * @description Red
     * @type {number}
     * @param {number} value number inclusively between 0 and 255
     */

    get B() { return this.value & this.bases.B; }
    set B(value) { return this.flex(this.bases.B, value); }

    /**
     * @description The color in hex-representation
     * @type {string}
     * @param {string} value
     */

    get hex() { return `00000${this.value.toString(16)}`.substr(-6); }
    set hex(value) {
        if (typeof value === "string") {
            if (value.length === 3) {
                this.R = parseInt(value[0].repeat(2), 16);
                this.G = parseInt(value[1].repeat(2), 16);
                this.B = parseInt(value[2].repeat(2), 16);
            } else if (value.length === 6) {
                this.R = parseInt(value.substr(0, 2), 16);
                this.G = parseInt(value.substr(2, 2), 16);
                this.B = parseInt(value.substr(4, 2), 16);
            }
        }
    }

    /**
     * @description The color a number array representation ([RED, GREEN, BLUE])
     * @type {number[]}
     * @param {number[]} rgb
     */

    get rgb() { return [this.R, this.G, this.B]; }
    set rgb(rgb) {
        rgb.slice(0, 3).forEach((a, i) => {
            if (typeof a === "number") {;
                if (i === 0) this.R = a;
                if (i === 1) this.G = a;
                if (i === 2) this.B = a;
            }
        });
    }

    /**
     * @description Performs adjustments based on an entered bit representation
     * * `NUMBER` - bit value
     * * `STRING` - hex
     * * `OBJECT` - {R: number, G: number, B: number}
     * @param {number|string|(Object<string, number>)} bit
     */

    resolve(bit) {
        if (typeof bit === "string")
            this.hex = bit;
        else if (Array.isArray(bit))
            this.rgb = bit;
        else if (Object.prototype.toString.call(bit) === "[object Object]")
            Object.entries(bit).forEach(([k, v]) => {
                if (/r/i.test(k)) this.R = v;
                if (/g/i.test(k)) this.G = v;
                if (/b/i.test(k)) this.B = v;
            });
        else
            super.resolve(bit);
    }

}

Color.BASES = {
    R: ((1 << 24) - 1) ^ ((1 << 16) - 1),
    G: ((1 << 16) - 1) ^ ((1 << 8) - 1),
    B: (1 << 8) - 1,
};

module.exports = Color;
