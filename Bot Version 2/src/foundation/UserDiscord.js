"use strict";

const Util = require("../util/Util");

const {
    Discord: {
        regex: {
            USER_ID: DISCORD_USER_ID_REGEX
        }
    }
} = require("../util/Constants");

const {
    Message,
    User
} = require("discord.js");

/**
 * @description A Discord user for storage of data
 */

class UserDiscord {

    /**
     * @constructor
     * @param {Object|User} data 
     */

    constructor(data) {
        this.build();
        this.handler(data);
    }

    build() {

        /**
         * @description The identification number of the Discord user
         * @type {BigInt}
         */

        this.disID = 0n;

        /**
         * @description Whether the Discord user is a bot
         * @type {boolean}
         */

        this.bot = false;

        /**
         * @description Whether the Discord user is a labeled as a "SYSTEM" user
         * @type {boolean}
         */

        this.system = false;

        /**
         * @description The user's Discord username
         * @type {string}
         */

        this.username = null;

        /**
         * @description The user's Discord discriminator
         * @type {number}
         */

        this.discriminator = 0;

    }

    /**
     * @returns {boolean} Whether the Discord userID is a valid number for an ID
     */

    get disIDValid() { return this.disID > 0; }

    /**
     * @returns {string} The discriminator in the stringified format "####"
     */

    get discriminatorDisplay() { return `000${this.discriminator}`.substr(-4); }

    /**
     * @param {?string} tag
     * @returns {string} username#discriminatorDisplay
     */

    get tag() { return `${this.username || ""}#${this.discriminatorDisplay}`; }

    set tag(tag) {
        tag = typeof tag === "string" ? tag.split("#") : [];
        this.username = tag[0] || null;
        this.discriminator = Number(tag[1]) || 0;
    }

    /**
     * @param {Message} data
     */

    handlerMessage(data) {
        if (data.author) this.handlerUser(data.author);
        return this;
    }

    /**
     * @param {User} data
     */

    handlerUser(data) {
        return this.parse({
            disID: data.id,
            bot: data.bot,
            system: data.system,
            username: data.username,
            discriminator: data.discriminator
        });
    }

    /**
     * @param {string|number|BigInt} data
     */

    handlerNumber(data) {
        this.disID = BigInt(data || 0);
        return this;
    }

    handler(data) {
        if (data instanceof Message)
            this.handlerMessage(data);
        else if (data instanceof User)
            this.handlerUser(data);
        else if (["string", "number", "bigint"].includes(typeof data) && DISCORD_USER_ID_REGEX.test(data))
            this.handlerNumber(data);
        else
            this.parse(data);
        return this;
    };

    parse(data) {
        if (!Util.isObjectNormal(data))
            data = {};
        if ("disID" in data) this.handlerNumber(data.disID);
        if ("bot" in data) this.bot = data.bot === true;
        if ("system" in data) this.system = data.system === true;
        if ("tag" in data) this.tag = data.tag;
        if ("username" in data) this.username = data.username;
        if ("discriminator" in data) this.discriminator = Number(data.discriminator) || 0;
        return this;
    }

    toJSON() {
        return Util.flatten(this);
    }

}

module.exports = UserDiscord;