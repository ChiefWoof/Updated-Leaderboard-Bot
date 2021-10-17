"use strict";

const BitField = require("./BitField");

/**
 * @description The status of the Discord User on the bot
 * @extends {BitField}
 */

class UserStatusBot extends BitField {

    /**
     * @description Whether the user is considered a regular Discord user
     * @type {boolean}
     * @param {boolean} bool
     */

    get NORMAL() { return this.has(this.indicators.NORMAL); }
    set NORMAL(bool) { return this.resolveBitBoolean(this.indicators.NORMAL, bool); }

    /**
     * @description Whether the user is limited on useable commands on the bot
     * @type {boolean}
     * @param {boolean} bool
     */

    get LIMITED() { return this.has(this.indicators.LIMITED); }
    set LIMITED(bool) { return this.resolveBitBoolean(this.indicators.LIMITED, bool); }

    /**
     * @description Whether the user is blocked from using the bot
     * @type {boolean}
     * @param {boolean} bool
     */

    get BLOCKED() { return this.has(this.indicators.BLOCKED); }
    set BLOCKED(bool) { return this.resolveBitBoolean(this.indicators.BLOCKED, bool); }

}

UserStatusBot.INDICATORS = {

    NORMAL: 1 << 0,
    LIMITED: 1 << 2,
    BLOCKED: 1 << 3

};

module.exports = UserStatusBot;