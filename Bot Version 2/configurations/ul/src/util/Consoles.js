"use strict";

const BitField = require("./BitField");

/**
 * @description The various devices a user can use
 * @extends {BitField}
 */

class Consoles extends BitField {

    /**
     * @description Whether the user uses any mobile device
     * @type {boolean}
     * @param {boolean} bool
     */

    get mobile() { return this.has(this.indicators.MOBILE); }
    set mobile(bool) { return this.resolveBitBoolean(this.indicators.MOBILE, bool); }

    /**
     * @description Whether the user uses an IOS mobile device (iPhone, iPad, iPod, etc...)
     * @type {boolean}
     * @param {boolean} bool
     */

    get mobileIOS() { return this.has(this.indicators.MOBILE_IOS); }
    set mobileIOS(bool) { return this.resolveBitBoolean(this.indicators.MOBILE_IOS, bool); }

    /**
     * @description Whether the user uses an Android mobile device
     * @type {boolean}
     * @param {boolean} bool
     */

    get mobileAndroid() { return this.has(this.indicators.MOBILE_ANDROID); }
    set mobileAndroid(bool) { return this.resolveBitBoolean(this.indicators.MOBILE_ANDROID, bool); }

    /**
     * @description Whether the user uses any mobile device
     * @type {boolean}
     * @param {boolean} bool
     */

    get pc() { return this.has(this.indicators.PC); }
    set pc(bool) { return this.resolveBitBoolean(this.indicators.PC, bool); }

    /**
     * @description Whether the user uses an IOS pc device (Mac)
     * @type {boolean}
     * @param {boolean} bool
     */

    get pcIOS() { return this.has(this.indicators.PC_IOS); }
    set pcIOS(bool) { return this.resolveBitBoolean(this.indicators.PC_IOS, bool); }

    /**
     * @description Whether the user uses an Android mobile device
     * @type {boolean}
     * @param {boolean} bool
     */

    get pcWindows() { return this.has(this.indicators.PC_WINDOWS); }
    set pcWindows(bool) { return this.resolveBitBoolean(this.indicators.PC_WINDOWS, bool); }

    /**
     * @description Updates the value of the general mobile bit if necessary
     */

    patch_mobile() {
        this.mobile = this.mobile
        || this.mobileIOS
        || this.mobileAndroid;
    }

    /**
     * @description Updates the value of the general pc bit if necessary
     */

    patch_pc() {
        this.pc = this.pc
        || this.pcWindows
        || this.pcIOS;
    }

}

Consoles.INDICATORS = {

    // MOBILE (0-7);
    MOBILE: 1 << 0,
    MOBILE_IOS: 1 << 1,
    MOBILE_ANDROID: 1 << 2,

    // PC (8-15)
    PC: 1 << 8,
    PC_WINDOWS: 1 << 9,
    PC_IOS: 1 << 10


};

module.exports = Consoles;
