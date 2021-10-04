"use strict";

const { Message } = require("../lib/node_modules/discord.js");
const ChatCommand = require("./ChatCommand");

/**
 * @description A combination of a Discord message and ChatCommand
 */

class ChatCommandMessage {

    /**
     * @constructor
     * @param {Message} msg
     */

    constructor(msg) {

        /**
         * @type {Message}
         */

        this.message = msg || null;

        /**
         * @type {ChatCommand}
         */

        this.command = msg || null;

    }

    /**
     * @returns {boolean} Whether the "message" index is an actual Discord message
     */

    get hasMessage() { return this.message instanceof Message; }

    /**
     * @returns {boolean} Whether the "message" index is an actual Discord message
     */

    get hasCommand() { return this.command instanceof ChatCommand; }

    /**
     * @returns {boolean} Whether the "message" index is an actual Discord message
     */

    get messageContent() { return this.hasMessage && this.message.content ? this.message.content : null; }

    /**
     * @param {Object} [options={}]
     * @param {(string | RegExp)[]} [options.prefixes=[]] Prefixes to start the command string with
     * @param {(string | RegExp)[]} [options.callers=[]] Callers that denote the command to use
     * @param {(string | RegExp)[]} [options.flags] Key words to be flagged when used
     * @param {string} str 
     */

    handler(options={}, str=this.messageContent) {
        this.command = new ChatCommand(options, str);
        return this;
    }

}

module.exports = ChatCommandMessage;