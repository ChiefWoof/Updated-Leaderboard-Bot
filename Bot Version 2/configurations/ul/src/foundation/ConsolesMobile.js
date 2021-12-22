"use strict";

const BitField = require("../util/BitField");

/**
 * @description The various mobile devices a user can use
 * @extends {BitField}
 */

class ConsolesMobile extends BitField {

    /**
     * @description Whether the user uses any mobile device
     * @type {boolean}
     * @param {boolean} bool
     */

    get mobile() { return this.has(this.indicators.mobile); }
    set mobile(bool) { return this.resolveBitBoolean(this.indicators.mobile, bool); }

    /**
     * @description Whether the user uses an IOS mobile device (iPhone, iPad, iPod, etc...)
     * @type {boolean}
     * @param {boolean} bool
     */

    get IOS() { return this.has(this.indicators.IOS); }
    set IOS(bool) { return this.resolveBitBoolean(this.indicators.IOS, bool); }

    /**
     * @description Whether the user uses an Android mobile device
     * @type {boolean}
     * @param {boolean} bool
     */

    get ANDROID() { return this.has(this.indicators.ANDROID); }
    set ANDROID(bool) { return this.resolveBitBoolean(this.indicators.ANDROID, bool); }

    /**
     * @description Updates the value of the general mobile bit if necessary
     */

    patch() { this.mobile = Object.values(this.indicatorsObj()).includes(true); }

}

ConsolesMobile.INDICATORS = {

    mobile: 1 << 0,
    IOS: 1 << 1,
    ANDROID: 1 << 2,

};

module.exports = ConsolesMobile;
