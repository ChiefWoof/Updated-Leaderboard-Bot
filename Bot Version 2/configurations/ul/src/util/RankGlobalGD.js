"use strict";

const Emote = require("../../../../src/foundation/Emote");
const {
    Discord: {
        emotes: {
            gd: {
                trophies: {
                    top_1: EMOTE_TROPHY_1,
                    gold: EMOTE_TROPHY_GOLD,
                    silver: EMOTE_TROPHY_SILVER,
                    bronze: EMOTE_TROPHY_BRONZE,
                    green: EMOTE_TROPHY_GREEN,
                    blue: EMOTE_TROPHY_BLUE,
                    purple: EMOTE_TROPHY_PURPLE,
                    default: EMOTE_TROPHY_DEFAULT
                }
            }
        }
    }
} = require("./Constants");

/**
 * @typedef { "TOP_1"
 * | "GOLD"
 * | "SILVER"
 * | "BRONZE"
 * | "GREEN"
 * | "BLUE"
 * | "PURPLE"
 * | "DEFAULT"
 * } TROPHY_NAMES
 */

/**
 * @description A numerical representation of a player's star-global ranking position. Where
 * rank is 0 or a positive integer. Ranks, larger in magnitude, are considered as smaller
 * ranks than those lower in magnitude. With the exception of 0, unranked.
 * * `0` - Unranked
 * * `1` - The highest rank
 * * `>1`- A rank lower than 1
 * @extends {Number}
 */

class RankGlobalGD extends Number {

    /**
     * @description Whether the rank is a valid number
     * @type {boolean}
     */

    get hasRank() { return Number.isInteger(this.valueOf()) && this.valueOf() > 0; }

    /**
     * @description Whether the rank is within the Top 10
     * @type {boolean}
     */

    get isTop10() { return this.hasRank && this.valueOf() <= 10; }

    /**
     * @description Whether the rank is within the Top 50
     * @type {boolean}
     */

    get isTop50() { return this.hasRank && this.valueOf() <= 50; }

    /**
     * @description Whether the rank is within the Top 100
     * @type {boolean}
     */

    get isTop100() { return this.hasRank && this.valueOf() <= 100; }

    /**
     * @description Whether the rank is within the Top 200
     * @type {boolean}
     */

    get isTop200() { return this.hasRank && this.valueOf() <= 200; }

    /**
     * @description Whether the rank is within the Top 500
     * @type {boolean}
     */

    get isTop500() { return this.hasRank && this.valueOf() <= 500; }

    /**
     * @description Whether the rank is within the Top 1000
     * @type {boolean}
     */

    get isTop1000() { return this.hasRank && this.valueOf() <= 1000; }



    /**
     * @description Whether the highest trophy is top 1
     * @type {boolean}
     */

    get isTrophyTop1() { return this.valueOf() == 1; }

    /**
     * @description Whether the highest trophy is gold
     * @type {boolean}
     */

    get isTrophyGold() { return this.hasRank && this.valueOf() > 1 && this.valueOf() <= RankGlobalGD.TROPHY_GOLD_THRESHOLD; }

    /**
     * @description Whether the highest trophy is silver
     * @type {boolean}
     */

    get isTrophySilver() { return this.hasRank && this.valueOf() > RankGlobalGD.TROPHY_GOLD_THRESHOLD && this.valueOf() <= RankGlobalGD.TROPHY_SILVER_THRESHOLD; }

    /**
     * @description Whether the highest trophy is bronze
     * @type {boolean}
     */

    get isTrophyBronze() { return this.hasRank && this.valueOf() > RankGlobalGD.TROPHY_SILVER_THRESHOLD && this.valueOf() <= RankGlobalGD.TROPHY_BRONZE_THRESHOLD; }

    /**
     * @description Whether the highest trophy is green
     * @type {boolean}
     */

    get isTrophyGreen() { return this.hasRank && this.valueOf() > RankGlobalGD.TROPHY_BRONZE_THRESHOLD && this.valueOf() <= RankGlobalGD.TROPHY_GREEN_THRESHOLD; }

    /**
     * @description Whether the highest trophy is blue
     * @type {boolean}
     */

    get isTrophyBlue() { return this.hasRank && this.valueOf() > RankGlobalGD.TROPHY_GREEN_THRESHOLD && this.valueOf() <= RankGlobalGD.TROPHY_BLUE_THRESHOLD; }

    /**
     * @description Whether the highest trophy is purple
     * @type {boolean}
     */

    get isTrophyPurple() { return this.hasRank && this.valueOf() > RankGlobalGD.TROPHY_BLUE_THRESHOLD && this.valueOf() <= RankGlobalGD.TROPHY_PURPLE_THRESHOLD; }

    /**
     * @description Whether the highest trophy is the default trophy
     * @type {boolean}
     */

    get isTrophyDefault() { return this.hasRank && this.valueOf() > RankGlobalGD.TROPHY_PURPLE_THRESHOLD; }



    /**
     * @description Returns the name of the highest rank trophy or "DEFAULT"
     * @type {TROPHY_NAMES} 
     */

    get trophyType() {
        return this.hasRank
            ? this.isTrophyTop1
                ? "TOP_1"
            : this.isTrophyGold
                ? "GOLD"
            : this.isTrophySilver
                ? "SILVER"
            : this.isTrophyBronze
                ? "BRONZE"
            : this.isTrophyGreen
                ? "GREEN"
            : this.isTrophyBlue
                ? "BLUE"
            : this.isTrophyPurple
                ? "PURPLE"
            : "DEFAULT"
        : "DEFAULT";
    }

    /**
     * @type {?Emote}
     */

    get trophyEmote() {
        switch (this.trophyType) {
            default: { return null; }
            case "TOP_1": { return EMOTE_TROPHY_1; }
            case "GOLD": { return EMOTE_TROPHY_GOLD; }
            case "SILVER": { return EMOTE_TROPHY_SILVER; }
            case "BRONZE": { return EMOTE_TROPHY_BRONZE; }
            case "GREEN": { return EMOTE_TROPHY_GREEN; }
            case "BLUE": { return EMOTE_TROPHY_BLUE; }
            case "PURPLE": { return EMOTE_TROPHY_PURPLE; }
            case "DEFAULT": { return EMOTE_TROPHY_DEFAULT; }
        }
    }

}

RankGlobalGD.TROPHY_GOLD_THRESHOLD = 10;
RankGlobalGD.TROPHY_SILVER_THRESHOLD = 50;
RankGlobalGD.TROPHY_BRONZE_THRESHOLD = 100;
RankGlobalGD.TROPHY_GREEN_THRESHOLD = 200;
RankGlobalGD.TROPHY_BLUE_THRESHOLD = 500;
RankGlobalGD.TROPHY_PURPLE_THRESHOLD = 1000;


module.exports = RankGlobalGD;
