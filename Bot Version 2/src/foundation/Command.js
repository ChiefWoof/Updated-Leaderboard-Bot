"use strict";

const Client = require("../client/ClientDiscord");
const Util = require("../util/Util");

const ChatCommandMessage = require("./ChatCommandMessage");
const ChatCommand = require("./ChatCommand");

const {
    GuildMember,
    Message,
    User
} = require("../lib/node_modules/discord.js");

class Command {

    /**
     * @description Whether the command labeled as useable by users
     * @type {boolean}
     */

    static ENABLED = false;

    /**
     * @description The user's bot status requirements in order to use the command
     * @type {boolean}
     */

    static STATUS_BOT = 0;

    /**
     * @description The user's UL status requirements in order to use the command
     * @type {boolean}
     */

    static STATUS_UL = 0;

    /**
     * @description The user's GD status requirements in order to use the command
     * @type {boolean}
     */

    static STATUS_GD = 0;

    /**
     * @constructor
     * @param {Client} client
     * @param {ChatCommandMessage
     * |GuildMember
     * |Message
     * |User
     * |ChatCommand
     * |{
     * ChatCommandMessage: ChatCommandMessage,
     * GuildMember: GuildMember,
     * Message: Message,
     * User: User,
     * ChatCommand: ChatCommand
     * }} data
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
     * @description Whether the command can be used by a user
     * @returns {boolean}
     */

    async hasPermissionUse() { return true; }

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
     * @param {GuildMember} data
     */

    async handlerGuildMember(data) { return this; }

    /**
     * @async
     * @param {Message} data
     */

    async handlerMessage(data) { return this; }

    /**
     * @async
     * @param {User} data
     */

    async handlerUser(data) { return this; }

    /**
     * @async
     * @description The handler for when the command is ready for use
     */

    async handlerReady() { return this; }

    /**
     * @async
     * @param {ChatCommandMessage
     * |GuildMember
     * |Message
     * |User
     * |ChatCommand
     * |{
     * ChatCommandMessage: ChatCommandMessage,
     * GuildMember: GuildMember,
     * Message: Message,
     * User: User,
     * ChatCommand: ChatCommand
     * }} data
     */

    async handler(data) {
        if (data instanceof ChatCommandMessage) await this.handlerChatCommandMessage(data);
        else if (data instanceof GuildMember) await this.handlerGuildMember(data);
        else if (data instanceof Message) await this.handlerMessage(data);
        else if (data instanceof User) await this.handlerUser(data);
        else if (data instanceof ChatCommand) await this.handlerChatCommand(data);
        else if (Util.isObjectNormal(data)) {
            if ("ChatCommandMessage" in data) await this.handlerChatCommandMessage(data.ChatCommandMessage);
            if ("GuildMember" in data) await this.handlerGuildMember(data.GuildMember);
            if ("Message" in data) await this.handlerMessage(data.Message);
            if ("User" in data) await this.handlerUser(data.User);
            if ("ChatCommand" in data) await this.handlerChatCommand(data.ChatCommand);
        }
        return this;
    }

}

module.exports = Command;
