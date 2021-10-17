"use strict";

const BitField = require("./BitField");

const {
    ul: {
        stats: {
            emotes: {
                spreadsheet: {
                    stars: EMOTE_STARS,
                    diamonds: EMOTE_DIAMONDS,
                    scoins: EMOTE_SCOINS,
                    ucoins: EMOTE_UCOINS,
                    demons: EMOTE_DEMONS,
                    cp: EMOTE_CP,
                    net: EMOTE_NET,
                }
            }
        }
    }
} = require("./Constants");

/**
 * @typedef {Object} STAT_INDICATIONS
 * @property {boolean} stars
 * @property {boolean} diamonds
 * @property {boolean} scoins
 * @property {boolean} ucoins
 * @property {boolean} demons
 * @property {boolean} cp
 * @property {boolean} net
 */

/**
 * @description The status of a UL user's stat bans
 * @extends {BitField}
 */

class UserStatsBans extends BitField {

    /**
     * @returns {STAT_INDICATIONS}
     */

    get bansObject() { return UserStatsBans.toBansObject(this.bansString); }

    /**
     * @returns {string}
     */

    get bansString() {
        return UserStatsBans.toBansString({
            stars: this.STARS,
            diamonds: this.DIAMONDS,
            scoins: this.SCOINS,
            ucoins: this.UCOINS,
            demons: this.DEMONS,
            cp: this.CP,
            net: this.NET
        });
    }

    /**
     * @description Whether the user is banned from the stars leaderboard
     * @type {boolean}
     * @param {boolean} bool
     */

    get STARS() { return this.has(this.indicators.STARS); }
    set STARS(bool) { return this.resolveBitBoolean(this.indicators.STARS, bool); }

    /**
     * @description Whether the user is banned from the diamonds leaderboard
     * @type {boolean}
     * @param {boolean} bool
     */

    get DIAMONDS() { return this.has(this.indicators.DIAMONDS); }
    set DIAMONDS(bool) { return this.resolveBitBoolean(this.indicators.DIAMONDS, bool); }

    /**
     * @description Whether the user is banned from the secret coins leaderboard
     * @type {boolean}
     * @param {boolean} bool
     */

    get SCOINS() { return this.has(this.indicators.SCOINS); }
    set SCOINS(bool) { return this.resolveBitBoolean(this.indicators.SCOINS, bool); }

    /**
     * @description Whether the user is banned from the user coins leaderboard
     * @type {boolean}
     * @param {boolean} bool
     */

    get UCOINS() { return this.has(this.indicators.UCOINS); }
    set UCOINS(bool) { return this.resolveBitBoolean(this.indicators.UCOINS, bool); }

    /**
     * @description Whether the user is banned from the demons leaderboard
     * @type {boolean}
     * @param {boolean} bool
     */

    get DEMONS() { return this.has(this.indicators.DEMONS); }
    set DEMONS(bool) { return this.resolveBitBoolean(this.indicators.DEMONS, bool); }

    /**
     * @description Whether the user is banned from the creator points leaderboard
     * @type {boolean}
     * @param {boolean} bool
     */

    get CP() { return this.has(this.indicators.CP); }
    set CP(bool) { return this.resolveBitBoolean(this.indicators.CP, bool); }

    /**
     * @description Whether the user is banned from the net score leaderboard
     * @type {boolean}
     */

    get NET() { return Object.values(this.indicatorsObj()).includes(true); }

    /**
     * @description Performs adjustments based on an entered bit representation
     * * `NUMBER` - bit value
     * * `STRING` - hex
     * * `OBJECT` - stat, boolean paired bit object representation
     * @param {number|string|(Object<string, number>)|STAT_INDICATIONS} bit
     */

    resolve(bit) {
        if (typeof bit === "string")
            this.resolve(UserStatsBans.toBansObject(bit));
        else if (Object.prototype.toString.call(bit) === "[object Object]" && !Object.keys(bit).every(k => /^[0-9]{1,}$/.test(k)))
            this.resolve(Object.entries(bit).reduce((v, [stat, bool]) => {
                if (/^(stars?)$/i.test(stat)) v[this.indicators.STARS] = bool;
                if (/^(diamonds?)$/i.test(stat)) v[this.indicators.DIAMONDS] = bool;
                if (/^(scoins?|secretcoins?|secret coins?|coins?)$/i.test(stat)) v[this.indicators.SCOINS] = bool;
                if (/^(ucoins?|usercoins?|user coins?)$/i.test(stat)) v[this.indicators.UCOINS] = bool;
                if (/^(demons?)$/i.test(stat)) v[this.indicators.DEMONS] = bool;
                if (/^(cp|creatorpoints?|creator points?)$/i.test(stat)) v[this.indicators.CP] = bool;
                return v;
            }, {}));
        else
            super.resolve(bit);
    }

}

UserStatsBans.INDICATORS = {

    STARS: 1 << 0,
    DIAMONDS: 1 << 2,
    SCOINS: 1 << 3,
    UCOINS: 1 << 4,
    DEMONS: 1 << 5,
    CP: 1 << 6

};

/**
 * @description Converts a string of bans represented by emotes to an
 * object version of the bans indexed by the stat name and a boolean value
 * @param {string} str
 * @returns {STAT_INDICATIONS}
 */

UserStatsBans.toBansObject = function(str="") {
    let bans = {};
    if (typeof str === "string") {
        bans.stars = str.includes(EMOTE_STARS);
        bans.diamonds = str.includes(EMOTE_DIAMONDS);
        bans.scoins = str.includes(EMOTE_SCOINS);
        bans.ucoins = str.includes(EMOTE_UCOINS);
        bans.demons = str.includes(EMOTE_DEMONS);
        bans.cp = str.includes(EMOTE_CP);
        bans.net = Object.values(bans).includes(true);
    }
    return bans;
}

/**
 * @description Converts a string of bans represented by emotes to an
 * object version of the bans indexed by the stat name and a boolean value
 * @param {STAT_INDICATIONS} obj
 * @returns {string}
 */

UserStatsBans.toBansString = function(obj={}) {
    return Object.entries(obj).reduce((v, [stat, bool]) => {
        if (!bool) return v;
        if (/^(stars?)$/i.test(stat)) v += EMOTE_STARS;
        if (/^(diamonds?)$/i.test(stat)) v += EMOTE_DIAMONDS;
        if (/^(scoins?|secretcoins?|secret coins?|coins?)$/i.test(stat)) v += EMOTE_SCOINS;
        if (/^(ucoins?|usercoins?|user coins?)$/i.test(stat)) v += EMOTE_UCOINS;
        if (/^(demons?)$/i.test(stat)) v += EMOTE_DEMONS;
        if (/^(cp|creatorpoints?|creator points?)$/i.test(stat)) v += EMOTE_CP;
        return v;
    }, "");
}

module.exports = UserStatsBans;