"use strict";

const Client = require("../client/ClientDiscord");

const ChatCommandMessage = require("./ChatCommandMessage");
const ChatCommand = require("./ChatCommand");

const { Message } = require("../lib/node_modules/discord.js");

class Command {

    /**
     * @constructor
     * @param {Client} client
     * @param {*} data
     */

    constructor(client, data=null) {

        Object.defineProperty(this, "client", { writable: true });

        /**
         * @description The client
         * @type {Client}
         */

        this.client = client;

        this.build();
        this.handler(data);
    }

    build() {}

    /**
     * @param {ChatCommand} data
     */

    handlerChatCommand(data) { return this; }

    /**
     * @param {Message} data
     */

    handlerMessage(data) { return this; }

    /**
     * 
     * @param {*} data 
     */

    handler(data) {
        if (data instanceof ChatCommandMessage) {
            this.handler(data.message);
            this.handler(data.command);
        }
        if (data instanceof Message) this.handlerMessage(data);
        if (data instanceof ChatCommand) this.handlerChatCommand(data);
        return this;
    }

}

module.exports = Command;