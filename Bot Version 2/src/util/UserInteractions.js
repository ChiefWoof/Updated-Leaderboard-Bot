"use strict";

const BitField = require("./BitField");

/**
 * @description Options for Discord user interactions
 * @extends {BitField}
 */

class UserInteractionOptions extends BitField {

    /**
     * @description Whether interactions should be accepted in general
     * @type {boolean}
     * @param {boolean} bool
     */

    get ACCEPTING() { return this.has(this.indicators.ACCEPTING); }
    set ACCEPTING(bool) { return this.resolveBitBoolean(this.indicators.ACCEPTING, bool); }

    /**
     * @description Whether the user should be able to do actions through chatting
     * @type {boolean}
     * @param {boolean} bool
     */

    get CHAT() { return this.has(this.indicators.CHAT); }
    set CHAT(bool) { return this.resolveBitBoolean(this.indicators.CHAT, bool); }

    /**
     * @description Whether the user should be able to do actions through reactions
     * @type {boolean}
     * @param {boolean} bool
     */

    get REACTIONS() { return this.has(this.indicators.REACTIONS); }
    set REACTIONS(bool) { return this.resolveBitBoolean(this.indicators.REACTIONS, bool); }

    /**
     * @description Whether the user should be able to do actions through buttons
     * @type {boolean}
     * @param {boolean} bool
     */

    get BUTTONS() { return this.has(this.indicators.BUTTONS); }
    set BUTTONS(bool) { return this.resolveBitBoolean(this.indicators.BUTTONS, bool); }

}

UserInteractionOptions.INDICATORS = {

    // General
    ACCEPTING: 1 << 0,

    // Specific
    CHAT: 1 << 1,
    REACTIONS: 1 << 2,
    BUTTONS: 1 << 3

};

module.exports = UserInteractionOptions;
