"use strict";

const BitField = require("./BitField");

/**
 * @description The stat single-selection tool
 * @extends {BitField}
 */

class UserStatSelection extends BitField {

    /**
     * @description Whether no specific stat is selected
     * @type {boolean}
     * @param {boolean} bool
     */

    get NONE() { return this.hasFlex(this.bases.STATS, this.flexes.NONE); }
    set NONE(bool) { return this.flex(this.bases.STATS, bool ? this.flexes.NONE : 0); }

    /**
     * @description Whether stars stat is selected
     * @type {boolean}
     * @param {boolean} bool
     */

    get STARS() { return this.hasFlex(this.bases.STATS, this.flexes.STARS); }
    set STARS(bool) { return this.flex(this.bases.STATS, bool ? this.flexes.STARS : 0); }

    /**
     * @description Whether diamonds stat is selected
     * @type {boolean}
     * @param {boolean} bool
     */

    get DIAMONDS() { return this.hasFlex(this.bases.STATS, this.flexes.DIAMONDS); }
    set DIAMONDS(bool) { return this.flex(this.bases.STATS, bool ? this.flexes.DIAMONDS : 0); }

    /**
     * @description Whether secret coins stat is selected
     * @type {boolean}
     * @param {boolean} bool
     */

    get SCOINS() { return this.hasFlex(this.bases.STATS, this.flexes.SCOINS); }
    set SCOINS(bool) { return this.flex(this.bases.STATS, bool ? this.flexes.SCOINS : 0); }

    /**
     * @description Whether user coins stat is selected
     * @type {boolean}
     * @param {boolean} bool
     */

    get UCOINS() { return this.hasFlex(this.bases.STATS, this.flexes.UCOINS); }
    set UCOINS(bool) { return this.flex(this.bases.STATS, bool ? this.flexes.UCOINS : 0); }

    /**
     * @description Whether demons stat is selected
     * @type {boolean}
     * @param {boolean} bool
     */

    get DEMONS() { return this.hasFlex(this.bases.STATS, this.flexes.DEMONS); }
    set DEMONS(bool) { return this.flex(this.bases.STATS, bool ? this.flexes.DEMONS : 0); }

    /**
     * @description Whether creator points stat is selected
     * @type {boolean}
     * @param {boolean} bool
     */

    get CP() { return this.hasFlex(this.bases.STATS, this.flexes.CP); }
    set CP(bool) { return this.flex(this.bases.STATS, bool ? this.flexes.CP : 0); }

    /**
     * @description Whether net score stat is selected
     * @type {boolean}
     * @param {boolean} bool
     */

    get NET() { return this.hasFlex(this.bases.STATS, this.flexes.NET); }
    set NET(bool) { return this.flex(this.bases.STATS, bool ? this.flexes.NET : 0); }

    /**
     * @description Whether demonslist completions stat is selected
     * @type {boolean}
     * @param {boolean} bool
     */

    get DEMONSLIST() { return this.hasFlex(this.bases.STATS, this.flexes.DEMONSLIST); }
    set DEMONSLIST(bool) { return this.flex(this.bases.STATS, bool ? this.flexes.DEMONSLIST : 0); }

}

UserStatSelection.INDICATORS = {

    /// Stat bits (0-3)
    STATS_BIT_0: 1 << 0,
    STATS_BIT_1: 1 << 1,
    STATS_BIT_2: 1 << 2,
    STATS_BIT_3: 1 << 3,

};

UserStatSelection.BASES = {

    STATS: (1 << 4) - 1

};

UserStatSelection.FLEXES = {

    NONE: 0,

    STARS: 1,
    DIAMONDS: 2,
    SCOINS: 3,
    UCOINS: 4,
    DEMONS: 5,
    CP: 6,

    NET: 7,
    DEMONSLIST: 8

};

module.exports = UserStatSelection;