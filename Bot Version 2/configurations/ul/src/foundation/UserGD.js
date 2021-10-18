"use strict";

const Base = require("./Base");

const Consoles = require("../util/Consoles");
const IconSet = require("../util/IconSet");
const UserStatusGD = require("../util/UserStatusGD");

const {
    ul: {
        stats: {
            regex: {
                stars: REGEX_STARS,
                diamonds: REGEX_DIAMONDS,
                scoins: REGEX_SCOINS,
                ucoins: REGEX_UCOINS,
                demons: REGEX_DEMONS,
                cp: REGEX_CP
            }
        }
    }
} = require("../util/Constants");

/**
 * @description An instance of a Geometry Dash user
 * @extends {Base}
 */

class UserGD extends Base {

    /**
     * @constructor
     * @param {*} data 
     */

    constructor(data) {
        super(data);
        this.build();
        this.parse(data);
        this.patch();
    }

    build() {

        /**
         * @description The timestamp of the latest update to the user's stats
         * @type {?Date}
         */

        this.timestampRefreshedStats = null;

        /**
         * @description The user's status info
         * @type {UserStatusGD}
         */

        this.status = new UserStatusGD();

        /**
         * @description The identification number of the player's account
         * @type {BigInt}
         */

        this.accountID = 0n;

        /**
         * @description The identification number of the player
         * @type {BigInt}
         */

        this.playerID = 0n;

        /**
         * @description The player's username
         * @type {?string}
         */

        this.username = null;

        /**
         * @description The player's past usernames
         * @type {string[]}
         */

        this.usernamesPast = [];

        /**
         * @description The timestamps of when the player changed their username
         * @type {(Date|null)[]}
         */

        this.usernamesPastTimestamps = [];

        /**
         * @description The player's star count
         * @type {number}
         */

        this.stars = 0;

        /**
         * @description The player's diamond count
         * @type {number}
         */

        this.diamonds = 0;

        /**
         * @description The player's secret coin count
         * @type {number}
         */

        this.scoins = 0;

        /**
         * @description The player's user coin count
         * @type {number}
         */

        this.ucoins = 0;

        /**
         * @description The player's demon count
         * @type {number}
         */

        this.demons = 0;

        /**
         * @description The player's creator point count
         * @type {number}
         */

        this.cp = 0;

        /**
         * @description The devices the user plays on
         * @type {Consoles}
         */

        this.consoles = new Consoles();

        /**
         * @description The user's icon set
         * @type {IconSet}
         */

        this.iconSet = new IconSet();

        /**
         * @description The player's global leaderboard position
         * @type {number}
         */

        this.rankGlobal = 0;

        /**
         * @description The player's youtube channel
         * @type {?string}
         */

        this.youtube = null;

        /**
         * @description The player's twitter page
         * @type {?string}
         */

        this.twitter = null;

        /**
         * @description The player's twitch page
         * @type {?string}
         */

        this.twitch = null;

    }

    /**
     * @returns {boolean} Whether there is an identified account (accountID is not 0)
     */

    get hasAccount() { return this.accountID != 0; }

    /**
     * @returns {boolean} Whether the cp count is more than 0
     */

    get hasCP() { return this.cp > 0; }

    /**
     * @returns {boolean} Whether the global rank is greater than 0
     */

    get hasRankGlobal() { return this.rankGlobal > 0; }

    patch() {
        this.status.ACCOUNT = this.hasAccount;
        this.status.CP = this.hasCP;
        this.status.HAS_RANK_GLOBAL = this.hasRankGlobal;
    }

    parse(data={}) {
        Object.entries(data).forEach(([k, v]) => {
            if (/(timestampRefreshedStats?)/i.test(k)) this.timestampRefreshedStats = v;
            if (/(status)/i.test(k)) this.status.resolve(v);
            if (/(accountID)/i.test(k)) this.accountID = v;
            if (/(playerID)/i.test(k)) this.playerID = v;
            if (/(username)/i.test(k)) this.username = v;
            if (/(usernamesPast)/i.test(k)) this.usernamesPast = v;
            if (/(usernamesPastTimestamps)/i.test(k)) this.usernamesPastTimestamps = v;
            if (REGEX_STARS.test(k)) this.stars = v;
            if (REGEX_DIAMONDS.test(k)) this.diamonds = v;
            if (REGEX_SCOINS.test(k)) this.scoins = v;
            if (REGEX_UCOINS.test(k)) this.ucoins = v;
            if (REGEX_DEMONS.test(k)) this.demons = v;
            if (REGEX_CP.test(k)) this.cp = v;
            if (/(iconSet)/i.test(k)) this.iconSet.resolve(v);
            if (/(consoles?)/i.test(k)) this.consoles.resolve(v);
            if (/(rankGlobal)/i.test(k)) this.rankGlobal = v;
            if (/(youtube)/i.test(k)) this.youtube = v;
            if (/(twitter)/i.test(k)) this.twitter = v;
            if (/(twitch)/i.test(k)) this.twitch = v;
        });
        return this;
    }

}

module.exports = UserGD;