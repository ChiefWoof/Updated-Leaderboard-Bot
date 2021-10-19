"use strict";

const SwitchCustom = require("../../../../src/util/SwitchCustom");

const {
    ul: {
        stats: {
            netWeights: WEIGHTS,
            regex: {
                stars: REGEX_STARS,
                diamonds: REGEX_DIAMONDS,
                scoins: REGEX_SCOINS,
                ucoins: REGEX_UCOINS,
                demons: REGEX_DEMONS,
                cp: REGEX_CP,
                net: REGEX_NET,
                demonsList: REGEX_DEMONS_LIST
            }
        }
    }
} = require("./Constants");

/**
 * @typedef {Object} STATS_GENERAL
 * @property {number} [stars=0]
 * @property {number} [diamonds=0]
 * @property {number} [scoins=0]
 * @property {number} [ucoins=0]
 * @property {number} [demons=0]
 * @property {number} [cp=0]
 */

/**
 * @typedef {Object} STATS_SPECIAL
 * @property {number} [demonsList=0]
 */

/**
 * @description UL stats for GD users
 */

class UserStats {

    /**
     * @constructor
     * @param {STATS_GENERAL & STATS_SPECIAL} data 
     */

    constructor(data) {
        this.build();
        this.parse(data);
    }

    build() {

        /**
         * @description The amount of stars
         * @type {number}
         */

        this.stars = 0;

        /**
         * @description The amount of diamonds
         * @type {number}
         */

        this.diamonds = 0;

        /**
         * @description The amount of secret coins
         * @type {number}
         */

        this.scoins = 0;

        /**
         * @description The amount of user coins
         * @type {number}
         */

        this.ucoins = 0;

        /**
         * @description The amount of demons
         * @type {number}
         */

        this.demons = 0;

        /**
         * @description The amount of creator points
         * @type {number}
         */

        this.cp = 0;

        /**
         * @description The amount of completed demons on the demon list
         * @see {@link https://www.pointercrate.com/demonlist/}
         * @type {number}
         */

        this.demonsList = 0;

    }

    /**
     * @description The overall score of the stats
     * @returns {number}
     */

    get net() { return UserStats.calculateNet(this); }

    /**
     * @description The total raw overall score of the stats
     * @returns {number}
     */

    get netRaw() { return UserStats.calculateNetRaw(this); }

    /**
     * @description The total special overall score of the stats
     * @returns {number}
     */

    get netSpecial() { return UserStats.calculateNetSpecial(this); }

    /**
     * @param {STATS_GENERAL & STATS_SPECIAL} data 
     */

    parse(data={}) {
        Object.entries(data).forEach(([k, v]) => {
            UserStats.switchName(k, {
                failed: () => {},
                stars: () => this.stars = Number(v) || 0,
                diamonds: () => this.diamonds = Number(v) || 0,
                scoins: () => this.scoins = Number(v) || 0,
                ucoins: () => this.ucoins = Number(v) || 0,
                demons: () => this.demons = Number(v) || 0,
                cp: () => this.cp = Number(v) || 0,
                demonsList: () => this.demonsList = Number(v) || 0
            })();
        });
        return this;
    }

}

UserStats.WEIGHTS = WEIGHTS;

/**
 * @description Applies a switch to an entered key name, attempting to swap it for another name
 * @param {?string} keyName the key name to look up
 * @param {Object} [values]
 * @param {*} [values.failed = null] the default value to return 
 * @param {*} [values.stars = "Stars"] the star-value to return 
 * @param {*} [values.diamonds = "Diamonds"] the diamond-value to return 
 * @param {*} [values.scoins = "Secret Coins"] the secret-coin-value to return 
 * @param {*} [values.ucoins = "User Coins"] the user-coin-value to return 
 * @param {*} [values.demons = "Demons"] the demon-value to return 
 * @param {*} [values.cp = "Creator Points"] the cp-value to return 
 * @param {*} [values.net = "Net Score"] the net-value to return 
 * @returns {*} The selected value
 */

UserStats.switchName = function(keyName, {
    failed = null,
    stars = "Stars",
    diamonds = "Diamonds",
    scoins = "Secret Coins",
    ucoins = "User Coins",
    demons = "Demons",
    cp = "Creator Points",
    net = "Net Score",
    demonsList = "Demonlist"
}={}) {
    return new SwitchCustom(failed, ...[
        [REGEX_STARS, stars],
        [REGEX_DIAMONDS, diamonds],
        [REGEX_SCOINS, scoins],
        [REGEX_UCOINS, ucoins],
        [REGEX_DEMONS, demons],
        [REGEX_CP, cp],
        [REGEX_NET, net],
        [REGEX_DEMONS_LIST, demonsList]
    ]).switch(keyName);
}

/**
 * @param {STATS_GENERAL} data
 * @returns {number} The calculated raw score
 */
    
UserStats.calculateNetRaw = function({
    stars = 0,
    diamonds = 0,
    scoins = 0,
    ucoins = 0,
    demons = 0,
    cp = 0
}={}) {
    return [
        stars * WEIGHTS.stars,
        diamonds * WEIGHTS.diamonds,
        scoins * WEIGHTS.scoins,
        ucoins * WEIGHTS.ucoins,
        demons * WEIGHTS.demons,
        cp * WEIGHTS.cp
    ].reduce((v, a) => v += a, 0);
}

/**
 * @param {STATS_SPECIAL} data
 * @returns {number} The calculated special score
 */

UserStats.calculateNetSpecial = function({
    demonsList = 0
}={}) {
    return [
        demonsList * WEIGHTS.demonsList
    ].reduce((v, a) => v += a, 0);
}

/**
 * @param {STATS_GENERAL & STATS_SPECIAL} data
 * @returns {number} The calculated net score
 */

UserStats.calculateNet = function(data) {
    return [
        this.calculateNetRaw(data),
        this.calculateNetSpecial(data)
    ].reduce((v, a) => v += a, 0);
}

module.exports = UserStats;
