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
        if (typeof value === "string" && Color.REGEX.hex.test(value)) {
            this.rgb = Color.hexToRGB(value);
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
        if (typeof bit === "string" && Color.REGEX.hex.test(bit))
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

    /**
     * @description Adjusts the tint of the color
     * @param {number|string|bigint} percentage the percentage of 255 to adjust by
     */

    brighten(percentage=0) {
        if (["string", "number", "bigint"].includes(typeof percentage) && /^\d{1,}$/.test(`${percentage}`.replace(".", ""))) {
            percentage = Number(percentage) / 100;
            this.R = Math.max(0, Math.min(255, Math.round(this.R + 255 * percentage)));
            this.G = Math.max(0, Math.min(255, Math.round(this.G + 255 * percentage)));
            this.B = Math.max(0, Math.min(255, Math.round(this.B + 255 * percentage)));
        }
        return this;
    }

    /**
     * @description Adjusts the shade of the color
     * @param {number|string|bigint} percentage the percentage of 255 to adjust by
     */

    darken(percentage=0) {
        if (["string", "number", "bigint"].includes(typeof percentage) && /^\d{1,}$/.test(`${percentage}`.replace(".", ""))) {
            percentage = Number(percentage) / 100;
            this.R = Math.max(0, Math.min(255, Math.round(this.R - 255 * percentage)));
            this.G = Math.max(0, Math.min(255, Math.round(this.G - 255 * percentage)));
            this.B = Math.max(0, Math.min(255, Math.round(this.B - 255 * percentage)));
        }
        return this;
    }

    /**
     * @description Shifts the color on the color wheel to it's direct opposite color
     */

    inverse() {
        this.R = 255 - this.R;
        this.G = 255 - this.G;
        this.B = 255 - this.B;
        return this;
    }

}

Color.BASES = {
    R: ((1 << 24) - 1) ^ ((1 << 16) - 1),
    G: ((1 << 16) - 1) ^ ((1 << 8) - 1),
    B: (1 << 8) - 1,
};

Color.REGEX = {
    hex: /^#?([a-f0-9]{3}|[a-f0-9]{6})$/i
};

/**
 * @description Converts a hex string to an RGB array
 * @param {?string} str
 * @returns {[R: number, G: number, B: number]}
 */

Color.hexToRGB = function(str) {
    let rgb = [ 0, 0, 0 ];
    if (typeof str === "string" && Color.REGEX.hex.test(str)) {
        str = str.replace(/^#/, "");
        if (str.length === 3) {
            rgb[0] = parseInt(str[0].repeat(2), 16);
            rgb[1] = parseInt(str[1].repeat(2), 16);
            rgb[2] = parseInt(str[2].repeat(2), 16);
        } else if (str.length === 6) {
            rgb[0] = parseInt(str.substr(0, 2), 16);
            rgb[1] = parseInt(str.substr(2, 2), 16);
            rgb[2] = parseInt(str.substr(4, 2), 16);
        }
    }
    return rgb;
}

/**
 * @description Converts an RGB array to a hex code string
 * @param {number} [r=0] Red
 * @param {number} [g=0] Green
 * @param {number} [b=0] Blue
 * @returns {string}
 */

Color.RGBToHex = function(r, g, b) {
    if (Array.isArray(r))
        return Color.RGBToHex(...r);
    let hex = ["00", "00", "00"];
    if ([r, g, b].every(a => typeof a === "number" && a >= 0 && a <= 255)) {
        hex[0] = `${hex[0]}${r.toString(16)}`.substr(-2);
        hex[1] = `${hex[1]}${g.toString(16)}`.substr(-2);
        hex[2] = `${hex[2]}${b.toString(16)}`.substr(-2);
    }
    return hex.join("");
}

/**
 * @description Preset colors
 */

Color.PRESETS = {
    RED: new Color("FF0000"),
        DARK_RED: new Color("FF0000").darken(25),
        LIGHT_RED: new Color("FF0000").brighten(25),
    ORANGE: new Color("FF681F"),
        DARK_ORANGE: new Color("FF681F").darken(12.5),
        LIGHT_ORANGE: new Color("FF681F").brighten(12.5),
    YELLOW: new Color("FFFF00"),
        DARK_YELLOW: new Color("FFFF00").darken(12.5),
        LIGHT_YELLOW: new Color("FFFF00").brighten(36),
    GREEN: new Color("00FF00"),
        DARK_GREEN: new Color("00FF00").darken(25),
        LIGHT_GREEN: new Color("00FF00").brighten(36),
    CYAN: new Color("00FFFF"),
        DARK_CYAN: new Color("00FFFF").darken(12.5),
        LIGHT_CYAN: new Color("00FFFF").brighten(50),
    BLUE: new Color("0000FF"),
        DARK_BLUE: new Color("0000FF").darken(25),
        LIGHT_BLUE: new Color("0000FF").brighten(25),
    MAGENTA: new Color("FF00FF"),
        DARK_MAGENTA: new Color("FF00FF").darken(25),
        LIGHT_MAGENTA: new Color("FF00FF").brighten(25),
    PURPLE: new Color("660099"),
        DARK_PURPLE: new Color("660099").darken(17.5),
        LIGHT_PURPLE: new Color("660099").brighten(20),
    BROWN: new Color("964B00"),
        DARK_BROWN: new Color("964B00").darken(10),
        LIGHT_BROWN: new Color("964B00").brighten(10),

    BLACK: new Color(0),
        LIGHT_BLACK: new Color(0).brighten(15),
    WHITE: new Color("FFF"),
        DARK_WHITE: new Color("FFF").darken(5),

    GREY: new Color("FFF").darken(50),
        DARK_GREY: new Color("FFF").darken(75),
        LIGHT_GREY: new Color("FFF").darken(25),
    GRAY: new Color("FFF").darken(50),
        DARK_GRAY: new Color("FFF").darken(75),
        LIGHT_GRAY: new Color("FFF").darken(25)
};

module.exports = Color;
