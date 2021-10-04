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

    build() { return this; }

    /**
     * @async
     * @param {ChatCommandMessage} data
     */

    async handlerChatCommandMessage(data) { return this; }

    /**
     * @async
     * @param {ChatCommand} data
     */

    async handlerChatCommand(data) { return this; }

    /**
     * @async
     * @param {Message} data
     */

    async handlerMessage(data) { return this; }

    /**
     * @async
     * @description The handler for when the command is ready for use
     */

    async handlerReady() { return this; }

    /**
     * @async
     * @param {*} data 
     */

    async handler(data) {
        if (data instanceof ChatCommandMessage) await this.handlerChatCommandMessage(data);
        if (data instanceof Message) await this.handlerMessage(data);
        if (data instanceof ChatCommand) await this.handlerChatCommand(data);
        return await this.handlerReady();
    }

}

module.exports = Command;
