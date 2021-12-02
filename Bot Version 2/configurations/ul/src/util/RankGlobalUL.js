"use strict";

const RankGlobalGD = require("./RankGlobalGD");

const Emote = require("../../../../src/foundation/Emote");
const {
    Discord: {
        emotes: {
            ul: {
                trophies: {
                    top_1: EMOTE_TROPHY_1,
                    top_2: EMOTE_TROPHY_2,
                    top_3: EMOTE_TROPHY_3,
                    top_4: EMOTE_TROPHY_4,
                    top_5: EMOTE_TROPHY_5,
                    top_6: EMOTE_TROPHY_6,
                    top_7: EMOTE_TROPHY_7,
                    top_8: EMOTE_TROPHY_8,
                    top_9: EMOTE_TROPHY_9,
                    top_10: EMOTE_TROPHY_10,
                }
            }
        }
    }
} = require("./Constants");

/**
 * @typedef { "TOP_1"
 * | "TOP_2"
 * | "TOP_3"
 * | "TOP_4"
 * | "TOP_5"
 * | "TOP_6"
 * | "TOP_7"
 * | "TOP_8"
 * | "TOP_9"
 * | "TOP_10"
 * | "SILVER"
 * | "BRONZE"
 * | "GREEN"
 * | "BLUE"
 * | "PURPLE"
 * | "DEFAULT"
 * } TROPHY_NAMES
 */

/**
 * @description A UL numerical representation of a player's star-global ranking position. Where
 * rank is 0 or a positive integer. Ranks, larger in magnitude, are considered as smaller
 * ranks than those lower in magnitude. With the exception of 0, unranked.
 * * `0` - Unranked
 * * `1` - The highest rank
 * * `>1`- A rank lower than 1
 * @extends {RankGlobalGD}
 */

class RankGlobalUL extends RankGlobalGD {

    /**
     * @description Whether the highest trophy is top 1
     * @type {boolean}
     */

    get isTrophyTop1() { return this.valueOf() == 1; }

    /**
     * @description Whether the highest trophy is top 2
     * @type {boolean}
     */

    get isTrophyTop2() { return this.valueOf() == 2; }

    /**
     * @description Whether the highest trophy is top 3
     * @type {boolean}
     */

    get isTrophyTop3() { return this.valueOf() == 3; }

    /**
     * @description Whether the highest trophy is top 4
     * @type {boolean}
     */

    get isTrophyTop4() { return this.valueOf() == 4; }

    /**
     * @description Whether the highest trophy is top 5
     * @type {boolean}
     */

    get isTrophyTop5() { return this.valueOf() == 5; }

    /**
     * @description Whether the highest trophy is top 6
     * @type {boolean}
     */

    get isTrophyTop6() { return this.valueOf() == 6; }

    /**
     * @description Whether the highest trophy is top 7
     * @type {boolean}
     */

    get isTrophyTop7() { return this.valueOf() == 7; }

    /**
     * @description Whether the highest trophy is top 8
     * @type {boolean}
     */

    get isTrophyTop8() { return this.valueOf() == 8; }

    /**
     * @description Whether the highest trophy is top 9
     * @type {boolean}
     */

    get isTrophyTop9() { return this.valueOf() == 9; }

    /**
     * @description Whether the highest trophy is top 10
     * @type {boolean}
     */

    get isTrophyTop10() { return this.valueOf() == 10; }

    /**
     * @description Whether the highest trophy is gold
     * @type {boolean}
     */

    get isTrophyGold() { return false; }

    /**
     * @description Returns the name of the highest rank trophy or "DEFAULT"
     * @type {TROPHY_NAMES} 
     */

    get trophyType() {
        return this.isTrophyTop1
            ? "TOP_1"
        : this.isTrophyTop2
            ? "TOP_2"
        : this.isTrophyTop3
            ? "TOP_3"
        : this.isTrophyTop4
            ? "TOP_4"
        : this.isTrophyTop5
            ? "TOP_5"
        : this.isTrophyTop6
            ? "TOP_6"
        : this.isTrophyTop7
            ? "TOP_7"
        : this.isTrophyTop8
            ? "TOP_8"
        : this.isTrophyTop9
            ? "TOP_9"
        : this.isTrophyTop10
            ? "TOP_10"
        : super.trophyType;
    }

    /**
     * @type {?Emote}
     */

    get trophyEmote() {
        switch (this.trophyType) {
            default: { return super.trophyEmote; }
            case "TOP_1": { return EMOTE_TROPHY_1; }
            case "TOP_2": { return EMOTE_TROPHY_2; }
            case "TOP_3": { return EMOTE_TROPHY_3; }
            case "TOP_4": { return EMOTE_TROPHY_4; }
            case "TOP_5": { return EMOTE_TROPHY_5; }
            case "TOP_6": { return EMOTE_TROPHY_6; }
            case "TOP_7": { return EMOTE_TROPHY_7; }
            case "TOP_8": { return EMOTE_TROPHY_8; }
            case "TOP_9": { return EMOTE_TROPHY_9; }
            case "TOP_10": { return EMOTE_TROPHY_10; }
        }
    }

}

module.exports = RankGlobalUL;