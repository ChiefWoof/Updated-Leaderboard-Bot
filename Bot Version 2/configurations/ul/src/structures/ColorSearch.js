"use strict";

const SwitchCustom = require("../../../../src/util/SwitchCustom");
const Color = require("../../../../src/util/Color");

const { PRESETS } = Color;
const {
    ul: { colors: ColorUL }
} = require("../util/Constants");

class ColorSearch {}

class ColorSearchEntry {

    /**
     * @constructor
     * @param {string} name
     * @param {Color} color
     * @param {...(string|RegExp)} nicknames
     */

    constructor(name, color, ...nicknames) {

        /**
         * @description The official name of the color
         * @type {string}
         */

        this.name = name;

        /**
         * @description The color data
         * @type {Color}
         */

        this.color = color;

        /**
         * @description The nicknames of the color that can be used to lookup the color
         * @type {(string|RegExp)[]}
         */

        this.nicknames = nicknames || [];

    }

    /**
     * @description The official name of the color
     * @type {Color}
     */

    get colour() { return this.color; }

    /**
     * @description The primary nickname of the color
     * @type {?string}
     */

    get nicknamePrimary() { return this.nicknames.find(a => typeof a === "string") || null; }

    /**
     * @description The nickname entries that are strings
     * @type {string[]}
     */

    get nicknamesStrings() { return this.nicknames.reduce((v, a) => {
        if (typeof a === "string") v.push(a);
        return v;
    }, []); }

    /**
     * @description The nickname entries that are RegExp
     * @type {string[]}
     */

    get nicknamesRegexes() { return this.nicknames.reduce((v, a) => {
        if (a instanceof RegExp) v.push(a);
        return v;
    }, []); }

}

/**
 * @description The full list of preset colors
 * @type {PRESETS & ColorUL}
 */

ColorSearch.presets = Object.assign({}, PRESETS, ColorUL);

/**
 * @description The full list of available colors to search
 * @type {Object<string, ColorSearchEntry>}
 */

ColorSearch.entries = {};

/**
 * @description Adds a color to the list of colors
 * @param {string} name
 * @param {Color} color
 * @param {...(string|RegExp)} nicknames
 */

ColorSearch.add = function(name, color, ...nicknames) {
    if (!(typeof name === "string" && name))
        throw new Error("Invalid color name");
    if (!(color instanceof Color))
        throw new Error("Invalid color");
    if (!nicknames.every(a => (typeof a === "string" && a) || a instanceof RegExp))
        throw new Error("Not all nicknames for the color are valid");
    if (Object.keys(ColorSearch.entries).find(a => a.replace(/ /g, "").match(new RegExp(`^${name.replace(/ /g, "")}$`, "i"))) !== undefined)
        throw new Error(`Color "${name}" is already an entry`);
    ColorSearch.entries[name] = new ColorSearchEntry(name, color, ...nicknames);
}

/**
 * @description Searches for a color by its name
 * @param {string} str
 * @returns {?ColorSearchEntry}
 */

ColorSearch.searchName = function(str) {
    return Object.entries(ColorSearch.entries).reduce((v, [n, entry]) => {
        if (!v && n.replace(/ /g, "").match(new RegExp(`^${str.replace(/ /g, "")}$`, "i")))
            v = entry;
        return v;
    }, null);
}

/**
 * @description Searches for a color by its nicknames
 * @param {string} str
 * @returns {?ColorSearchEntry}
 */

ColorSearch.searchNickname = function(str) {
    return Object.entries(ColorSearch.entries).reduce((v, [n, entry]) => {
        if (!v && entry.nicknames.some(a => a instanceof RegExp ? a.test(str) : a.replace(/ /g, "").match(new RegExp(str.replace(/ /g, ""), "i"))))
            v = entry;
        return v;
    }, null);
}

/**
 * @description Searches for a color by its name and nicknames
 * @param {string} str
 * @returns {?ColorSearchEntry}
 */

ColorSearch.searchNames = function(str) {
    let data = Object.entries(ColorSearch.entries).reduce((v, [n, entry]) => {
        if (!v) {
            if (n.replace(/ /g, "").match(new RegExp(`^${str.replace(/ /g, "")}$`, "i")))
                v = entry;
            else if (entry.nicknames.some(a => a instanceof RegExp ? a.test(str) : a.replace(/ /g, "").match(new RegExp(str.replace(/ /g, ""), "i"))))
                v = entry;
        }
        return v;
    }, null);
    return data;
}

/**
 * @description Searches for a color by an entered RGB with a tolerance
 * @param {number} tolerance A number inclusively between 0 and 255 which determines how much
 * red, green, and blue are able to vary
 * @param {number} [r=0] Red
 * @param {number} [g=0] Green
 * @param {number} [b=0] Blue
 * @returns {?ColorSearchEntry}
 */

ColorSearch.searchRGB = function(tolerance, r=0, g=0, b=0) {
    if (Array.isArray(r))
        return ColorSearch.searchRGB(tolerance, ...r);
    return Object.entries(ColorSearch.entries).reduce((v, [n, entry]) => {
        if (!v && [
            entry.color.R - Number(r),
            entry.color.G - Number(g),
            entry.color.B - Number(b),
        ].every(a => Math.abs(a) <= tolerance))
            v = entry;
        return v;
    }, null);
}

/**
 * @description Searches for a color by an entered hex with a tolerance
 * @param {number} tolerance A number inclusively between 0 and 255 which determines how much
 * red, green, and blue are able to vary
 * @param {string} str the hexcode string
 * @returns {?ColorSearchEntry}
 */

ColorSearch.searchHex = function(tolerance, str) {
    return typeof str === "string" && Color.REGEX.hex.test(str)
    ? ColorSearch.searchRGB(tolerance, ...Color.hexToRGB(str))
    : null;
}

/**
 * @description A classic search that will pick what type of searches to use and then use them
 * @param {string} data
 * @param {number} tolerance A number inclusively between 0 and 255 which determines how much
 * red, green, and blue are able to vary
 * @returns {?ColorSearchEntry}
 */

ColorSearch.search = function(data, tolerance=0) {
    if (typeof data === "string") {
        let dataRGB = data.replace(/,/g, " ").split(" ").filter(a => /\d{1,3}/.test(a)).map(a => Number(a));
        if (dataRGB.length >= 3 && dataRGB.every(a => a >= 0 && a <= 255))
            return ColorSearch.search(dataRGB, tolerance);
        return data.startsWith("#")
        ? ColorSearch.searchHex(tolerance, data)
        : ColorSearch.searchNames(data);
    }
    if (Array.isArray(data))
        return ColorSearch.searchRGB(tolerance, ...data);
}


const { add, presets } = ColorSearch;

add("Red", presets.RED);
add("Dark Red", presets.DARK_RED);
add("Light Red", presets.LIGHT_RED);

add("Orange", presets.ORANGE);
add("Dark Orange", presets.DARK_ORANGE);
add("Light Orange", presets.LIGHT_ORANGE);

add("Yellow", presets.YELLOW);
add("Dark Yellow", presets.DARK_YELLOW);
add("Light Yellow", presets.LIGHT_YELLOW);

add("Green", presets.GREEN, "Neon", "Neon Green");
add("Dark Green", presets.DARK_GREEN);
add("Light Green", presets.LIGHT_GREEN);

add("Cyan", presets.CYAN);
add("Dark Cyan", presets.DARK_CYAN);
add("Light Cyan", presets.LIGHT_CYAN);

add("Blue", presets.BLUE);
add("Dark Blue", presets.DARK_BLUE);
add("Light Blue", presets.LIGHT_BLUE);

add("Purple", presets.PURPLE);
add("Dark Purple", presets.DARK_PURPLE);
add("Light Purple", presets.LIGHT_PURPLE);

add("Magenta", presets.MAGENTA, "Pink");
add("Dark Magenta", presets.DARK_MAGENTA, "Dark Pink");
add("Light Magenta", presets.LIGHT_MAGENTA, "Light Pink");

add("Brown", presets.BROWN);
add("Dark Brown", presets.DARK_BROWN);
add("Light Brown", presets.LIGHT_BROWN);

add("White", presets.WHITE);
add("Dark White", presets.DARK_WHITE);

add("Black", presets.BLACK);
add("Light Black", presets.LIGHT_BLACK);

add("Grey", presets.GREY);
add("Dark Grey", presets.DARK_GREY);
add("Light Grey", presets.LIGHT_GREY);

add("Gray", presets.GRAY);
add("Dark Gray", presets.DARK_GRAY);
add("Light Gray", presets.LIGHT_GRAY);

add("Updated Leaderboard", presets.UL, "ul");
add("woof", presets.WOOF, "8=8", /^8={1,}8$/);

add("valid", presets.VALID, /^(yes|check|1|true)$/i);
add("invalid", presets.INVALID, /^(no|x|error|0|false)$/i);

add("cooldown", presets.COOLDOWN);
add("settings", presets.SETTINGS);

add("stars", presets.STARS, /^(stars?)$/i);
add("diamonds", presets.DIAMONDS, /^(diamonds?)$/i);
add("secret coins", presets.SCOINS, /^(scoins?|secretcoins?|secret coins?|coins?)$/i);
add("user coins", presets.UCOINS, /^(ucoins?|usercoins?|user coins?)$/i);
add("demons", presets.DEMONS, /^(demons?)$/i);
add("creator points", presets.CP, /^(cp|creatorpoints?|creator points?)$/i);
add("net", presets.NET, /^(netscore|overall)$/i);

module.exports = ColorSearch;
