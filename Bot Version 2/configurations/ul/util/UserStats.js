"use strict";

const {
    ul: {
        stats: {
            netWeights: WEIGHTS
        }
    }
} = require("./Constants");

class UserStats {

    /**
     * @description Applies a switch to an entered key name, attempting to swap it for another name
     * @param {?string} keyName the key name to look up
     * @param {Object} [values]
     * @param {*} [values.failed = null] the default value to return 
     * @param {*} [values.stars = "STARS"] the star-value to return 
     * @param {*} [values.diamonds = "DIAMONDS"] the diamond-value to return 
     * @param {*} [values.scoins = "SECRET COINS"] the secret-coin-value to return 
     * @param {*} [values.ucoins = "USER COINS"] the user-coin-value to return 
     * @param {*} [values.demons = "DEMONS"] the demon-value to return 
     * @param {*} [values.cp = "CP"] the cp-value to return 
     * @returns {*} The selected value
     */

    static switchName(keyName, {
        failed = null,
        stars = "STARS",
        diamonds = "DIAMONDS",
        scoins = "SECRET COINS",
        ucoins = "USER COINS",
        demons = "DEMONS",
        cp = "CP"
    }={}) {
        switch (keyName) {
            default: return failed;
            case "stars": return stars;
            case "diamonds": return diamonds;
            case "scoins": return scoins;
            case "ucoins": return ucoins;
            case "demons": return demons;
            case "cp": return cp;
        }
    }

    /**
     * @param {Object} data
     * @returns {number} The calculated net score
     */

    static calculateNet(data) {
        return [
            this.calculateNetRaw(data),
            this.calculateNetSpecial(data)
        ].reduce((v, a) => v += a, 0);
    }

    /**
     * @param {Object} [data] 
     * @param {number} [data.demonsList]
     * @returns {number} The calculated special score
     */

    static calculateNetSpecial({
        demonsList = 0
    }={}) {
        return [
            demonsList * WEIGHTS.demonsList
        ].reduce((v, a) => v += a, 0);
    }

    /**
     * @param {Object} [data] 
     * @param {number} [data.stars]
     * @param {number} [data.diamonds]
     * @param {number} [data.scoins]
     * @param {number} [data.ucoins]
     * @param {number} [data.demons]
     * @param {number} [data.cp]
     * @returns {number} The calculated raw score
     */
    
    static calculateNetRaw({
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

}

UserStats.WEIGHTS = WEIGHTS;

module.exports = UserStats;