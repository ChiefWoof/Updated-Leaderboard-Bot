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

    get TRAINEE() { return this.hasFlex(this.bases.HELPER_LEVEL, this.flexes.TRAINEE); }
    set TRAINEE(bool) { return this.flex(this.bases.HELPER_LEVEL, bool ? this.flexes.TRAINEE : 0); }

    /**
     * @description Whether the user is a helper
     * @type {boolean}
     * @param {boolean} bool
     */

    get HELPER() { return this.hasFlexOne(this.bases.HELPER_LEVEL, this.flexes.HELPER, this.flexes.OFFICER, this.flexes.DEV, this.flexes.ALPHA); }
    set HELPER(bool) { return this.flex(this.bases.HELPER_LEVEL, bool ? this.flexes.HELPER : 0); }

    /**
     * @description Whether the user is a officer-level helper
     * @type {boolean}
     * @param {boolean} bool
     */

    get OFFICER() { return this.hasFlexOne(this.bases.HELPER_LEVEL, this.flexes.OFFICER, this.flexes.DEV, this.flexes.ALPHA); }
    set OFFICER(bool) { return this.flex(this.bases.HELPER_LEVEL, bool ? this.flexes.OFFICER : 0); }

    /**
     * @description Whether the user is a developer-level helper
     * @type {boolean}
     * @param {boolean} bool
     */

    get DEV() { return this.hasFlexOne(this.bases.HELPER_LEVEL, this.flexes.DEV, this.flexes.ALPHA); }
    set DEV(bool) { return this.flex(this.bases.HELPER_LEVEL, bool ? this.flexes.DEV : 0); }

    /**
     * @description Whether the user is a alpha-level helper
     * @type {boolean}
     * @param {boolean} bool
     */

    get ALPHA() { return this.hasFlex(this.bases.HELPER_LEVEL, this.flexes.ALPHA); }
    set ALPHA(bool) { return this.flex(this.bases.HELPER_LEVEL, bool ? this.flexes.ALPHA : 0); }

    /**
     * @description Whether the user is a an admin for UltimateGDBot
     * @type {boolean}
     * @param {boolean} bool
     */

    get UGDB_ADMIN() { return this.has(this.indicators.UGDB_ADMIN); }
    set UGDB_ADMIN(bool) { return this.resolveBitBoolean(this.indicators.UGDB_ADMIN, bool); }

    /**
     * @description Whether the user helps to develop GDBrowser
     * @type {boolean}
     * @param {boolean} bool
     */

    get GDBROWSER_DEV() { return this.has(this.indicators.GDBROWSER_DEV); }
    set GDBROWSER_DEV(bool) { return this.resolveBitBoolean(this.indicators.GDBROWSER_DEV, bool); }

    /**
     * @description Whether the user is a member of the "Star Grinders" Discord server
     * @type {boolean}
     * @param {boolean} bool
     */

    get SG() { return this.has(this.indicators.SG); }
    set SG(bool) { return this.resolveBitBoolean(this.indicators.SG, bool); }

}

UserStatusUL.INDICATORS = {

    /// helper level (0-3)
    HELPER_LEVEL_BIT_0: 1 << 0,
    HELPER_LEVEL_BIT_1: 1 << 1,
    HELPER_LEVEL_BIT_2: 1 << 2,

    // helper extensions (4 - 15)
    UGDB_ADMIN: 1 << 4,
    GDBROWSER_DEV: 1 << 5,

    // Star Grinders (16-20)
    SG: 1 << 16

};

UserStatusUL.BASES = {

    HELPER_LEVEL: 7

};

UserStatusUL.FLEXES = {

    TRAINEE: 1,
    HELPER: 2,
    OFFICER: 3,
    DEV: 4,
    ALPHA: 5,

};

module.exports = UserStatusUL;
