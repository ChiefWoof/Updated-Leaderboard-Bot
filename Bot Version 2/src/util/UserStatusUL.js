"use strict";

const BitField = require("./BitField");

/**
 * @description The status of the Discord User on the Updated Leaderboard
 * @extends {BitField}
 */

class UserStatusUL extends BitField {

    /**
     * @description Whether the user is a trainee for helper
     * @type {boolean}
     * @param {boolean} bool
     */

    get TRAINEE() { return this.has(this.indicators.TRAINEE); }
    set TRAINEE(bool) { return this.resolveBitBoolean(this.indicators.TRAINEE, bool); }

    /**
     * @description Whether the user is a helper
     * @type {boolean}
     * @param {boolean} bool
     */

    get HELPER() { return this.has(this.indicators.HELPER); }
    set HELPER(bool) { return this.resolveBitBoolean(this.indicators.HELPER, bool); }

    /**
     * @description Whether the user is a officer-level helper
     * @type {boolean}
     * @param {boolean} bool
     */

    get OFFICER() { return this.has(this.indicators.OFFICER); }
    set OFFICER(bool) { return this.resolveBitBoolean(this.indicators.OFFICER, bool); }

    /**
     * @description Whether the user is a developer-level helper
     * @type {boolean}
     * @param {boolean} bool
     */

    get DEV() { return this.has(this.indicators.DEV); }
    set DEV(bool) { return this.resolveBitBoolean(this.indicators.DEV, bool); }

    /**
     * @description Whether the user is a alpha-level helper
     * @type {boolean}
     * @param {boolean} bool
     */

    get ALPHA() { return this.has(this.indicators.ALPHA); }
    set ALPHA(bool) { return this.resolveBitBoolean(this.indicators.ALPHA, bool); }

}

UserStatusUL.INDICATORS = {

    // helpers (0 - 10)
    TRAINEE: 1 << 0,
    HELPER: 1 << 1,
    OFFICER: 1 << 2,
    DEV: 1 << 3,
    ALPHA: 1 << 4

};

module.exports = UserStatusUL;
