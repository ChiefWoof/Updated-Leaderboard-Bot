"use strict";

const BitField = require("./BitField");

/**
 * @description The various devices a user can use
 * @extends {BitField}
 */

class Consoles extends BitField {

    /**
     * @description Whether the user plays on mobile
     * @type {boolean}
     * @param {boolean} bool
     */

    get MOBILE() { return this.has(this.indicators.MOBILE); }
    set MOBILE(bool) { return this.resolveBitBoolean(this.indicators.MOBILE, bool); }

    /**
     * @description Whether the user plays on PC
     * @type {boolean}
     * @param {boolean} bool
     */

    get PC() { return this.has(this.indicators.PC); }
    set PC(bool) { return this.resolveBitBoolean(this.indicators.PC, bool); }

}

Consoles.INDICATORS = {

    MOBILE: 1 << 0,
    PC: 1 << 2

};

module.exports = Consoles;