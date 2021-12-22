"use strict";

const BitField = require("../util/BitField");

/**
 * @description The various PC devices a user can use
 * @extends {BitField}
 */

class ConsolesPC extends BitField {

    /**
     * @description Whether the user uses any pc device
     * @type {boolean}
     * @param {boolean} bool
     */

    get pc() { return this.has(this.indicators.pc); }
    set pc(bool) { return this.resolveBitBoolean(this.indicators.pc, bool); }

    /**
     * @description Whether the user uses a Windows pc device
     * @type {boolean}
     * @param {boolean} bool
     */

    get WINDOWS() { return this.has(this.indicators.WINDOWS); }
    set WINDOWS(bool) { return this.resolveBitBoolean(this.indicators.WINDOWS, bool); }

    /**
     * @description Whether the user uses an IOS pc device (Mac)
     * @type {boolean}
     * @param {boolean} bool
     */

    get IOS() { return this.has(this.indicators.IOS); }
    set IOS(bool) { return this.resolveBitBoolean(this.indicators.IOS, bool); }

    /**
     * @description Whether the user uses an CHROME pc device (Mac)
     * @type {boolean}
     * @param {boolean} bool
     */

    get CHROME() { return this.has(this.indicators.CHROME); }
    set CHROME(bool) { return this.resolveBitBoolean(this.indicators.CHROME, bool); }

    /**
     * @description Whether the user uses an LINUX pc device (Mac)
     * @type {boolean}
     * @param {boolean} bool
     */

    get LINUX() { return this.has(this.indicators.LINUX); }
    set LINUX(bool) { return this.resolveBitBoolean(this.indicators.LINUX, bool); }

    /**
     * @description Updates the value of the general pc bit if necessary
     */

    patch_pc() {
        this.pc = this.pc
        || this.WINDOWS
        || this.IOS
        || this.CHROME
        || this.LINUX
    }

}

ConsolesPC.INDICATORS = {

    pc: 1 << 0,
    WINDOWS: 1 << 1,
    IOS: 1 << 2,
    CHROME: 1 << 3,
    LINUX: 1 << 4

};

module.exports = ConsolesPC;
