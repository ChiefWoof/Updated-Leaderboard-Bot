"use strict";

const BitField = require("./BitField");

class UserInputOptions extends BitField {

    /**
     * @description Whether the user should be able to do actions through chatting
     * @type {boolean}
     * @param {boolean} bool
     */

    get CHAT() { return this.has(this.indicators.CHAT); }
    set CHAT(bool) { return this.resolveBitBoolean((this.indicators.CHAT, bool)); }

    /**
     * @description Whether the user should be able to do actions through reactions
     * @type {boolean}
     * @param {boolean} bool
     */

    get REACTIONS() { return this.has(this.indicators.REACTIONS); }
    set REACTIONS(bool) { return this.resolveBitBoolean((this.indicators.REACTIONS, bool)); }

    /**
     * @description Whether the user should be able to do actions through buttons
     * @type {boolean}
     * @param {boolean} bool
     */

    get BUTTONS() { return this.has(this.indicators.BUTTONS); }
    set BUTTONS(bool) { return this.resolveBitBoolean((this.indicators.BUTTONS, bool)); }

}

UserInputOptions.INDICATORS = {
    CHAT: 1 << 0,
    REACTIONS: 1 << 1,
    BUTTONS: 1 << 2,
};

module.exports = UserInputOptions;