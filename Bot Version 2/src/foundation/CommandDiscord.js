"use strict";

const Client = require("../client/ClientDiscord");
const Util = require("../util/Util");

const ChatCommandMessage = require("./ChatCommandMessage");
const ChatCommand = require("./ChatCommand");

const InteractionManager = require("../managers/InteractionManager");

const CallbackManager = require("../managers/CallbackManager");
const CommandCallersManager = require("../managers/CommandCallersManager");

const {
    GuildMember,
    Message,
    User,
    MessageReaction,
    ButtonInteraction
} = require("../lib/node_modules/discord.js/");

/**
 * @description A base format for Discord-related commands
 */

class CommandDiscord {

    /**
     * @description Whether the command labeled as useable by users
     * @type {boolean}
     */

    static ENABLED = false;

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

        /**
         * @description The client
         * @type {InteractionManager}
         */

        this.userInteractions = new InteractionManager(undefined, {
            sentMessageCondition: async (...args) => await this.handlerSentMessageCondition.call(this, ...args),
            sentReactionCondition: async (...args) => await this.handlerSentReactionCondition.call(this, ...args),
            sentButtonCondition: async (...args) => await this.handlerSentButtonCondition.call(this, ...args),
        });

        /**
         * @description Collection of subcommands for the command
         * @type {CallbackManager}
         */

        this.commands = new CallbackManager();

        /**
         * @description Collection of subcommand callers for the command
         * @type {CommandCallersManager}
         */

        this.callers = new CommandCallersManager();

        /**
         * @description The Discord channelID where the message should be sent to
         * @type {BigInt}
         */

        this.disChannelID = 0n;

        /**
         * @description The Discord userID of the user who called the command
         * @type {BigInt}
         */

        this.callerDisID = 0n;

       /**
        * @description The bot's message response
        * @type {?Message}
        */

        this.msg = null;

        this.build();
        this.handler(data);
    }

    build() { return this; }

    /**
     * @returns {UserDiscord} Retrives the "UserDiscord" data of the "callerDisID" or returns a new one
     */

    get callerUserDiscord() { return this.client.actions.getDiscordUser.handle(this.callerDisID).result; }

    /**
     * @returns {boolean} Whether the userID of the caller is a valid ID
     */

    get hasCaller() { return typeof this.callerDisID != 0; }

    /**
     * @returns {boolean} Whether the disChannelID of the channel to post the message in is a valid ID
     */

    get hasDisChannelID() { return typeof this.disChannelID != 0; }

    /**
     * @returns {boolean} Whether the bot has posted a reply to the call
     */

    get hasMessage() { return this.msg instanceof Message; }

    get messageBuild() {
        return {
            content: "ERROR!"
        };
    }

    /**
     * @description Whether the command can be used by a user
     * @returns {Promise<boolean>}
     */

    async hasPermissionUse() { return true; }

    /**
     * @async
     * @description Updates the current bot message
     * @param {Object} contents message contents
     */

    async updateMessage(contents=this.messageBuild) {
        if (this.hasMessage) {
            let msg = await this.msg.edit(contents);
            this.msg = msg;
        }
        return this;
    }

    /**
     * @async
     * @description Setups the subcommands
     */

    async setupCommands() {
        this.commands.clear();

        this.commands.add("END", () => {
            this.userInteractions.settings.ACCEPTING = false;
        });

        return this;
    }

    /**
     * @async
     * @description Setups the subcommand callers
     */

    async setupCallers() {
        this.callers.clear();

        this.callers.add(/^end|stop/i, "END");

        return this;
    }

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

    /**
     * @async
     * @param {Message} data 
     * @returns {Promise<boolean>}
     */

    async handlerSentMessageCondition(data) {
        if (!data.author) return false;
        if (!this.hasCaller) return false;
        if (!this.hasDisChannelID) return false;
        if (`${data.author.id}` !== `${this.callerDisID}`) return false;
        if (`${data.channelId}` !== `${this.disChannelID}`) return false;

        let msgCmd = new ChatCommandMessage(data);
        msgCmd.handler({
            prefixes: this.client.prefixes.prefixesRegexDiscord
        });

        if (msgCmd.command.hasPrefix) {
            this.userInteractions.settings.ACCEPTING = false;
            return false;
        }

        return true;
    }

    /**
     * @async
     * @param {Message} data
     */

    async handlerSentMessage(data) {
        let msgCmd = new ChatCommandMessage(data);
        msgCmd.handler({ callers: this.callers.callersRegexDiscord });
        
        if (msgCmd.command.hasCaller) {
            let cmdID = this.callers.findCommandIDByIndex(msgCmd.command.caller.toLowerCase());
            if (this.commands.has(`${cmdID}`)) this.commands.get(`${cmdID}`).callback(msgCmd);
            await data.delete().catch(() => {});
        }

        return this;
    }

    /**
     * @async
     * @param {MessageReaction} reaction 
     * @param {User} user 
     * @returns {Promise<boolean>}
     */

    async handlerSentReactionCondition(reaction, user) {
        if (!user) return false;
        if (!this.hasDisChannelID) return false;
        if (!this.hasMessage) return false;
        if (`${reaction.message.channelId}` !== `${this.disChannelID}`) return false;
        if (`${reaction.message.id}` !== `${this.msg.id}`) return false;
        if (!this.hasCaller) return false;
        if (`${user.id}` !== `${this.callerDisID}`) {
            return false;
        };
        return true;
    }

    /**
     * @async
     * @param {MessageReaction} reaction 
     * @param {User} user 
     */

    async handlerSentReaction(reaction, user) {
        if (this.commands.has(`REACTION_${reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name}`))
            this.commands.get(`REACTION_${reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name}`).callback(reaction, user);
        return this;
    }

    /**
     * @async
     * @param {ButtonInteraction} data 
     * @returns {Promise<boolean>}
     */

    async handlerSentButtonCondition(data) {
        if (!this.hasDisChannelID) return false;
        if (!this.hasMessage) return false;
        if (`${data.channelId}` !== `${this.disChannelID}`) return false;
        if (`${data.message.id}` !== `${this.msg.id}`) return false;
        if (!this.hasCaller) return false;
        if (`${data.user.id}` !== `${this.callerDisID}`) {
            return false;
        };
        return true;
    }

    /**
     * @async
     * @param {ButtonInteraction} data
     */

    async handlerSentButton(data) {
        console.log(data);
        return this;
    }

    /**
     * @async
     * @description Starts running client-user interactions
     */

    async runInteractions() {
        if (!this.client.loggedIn)
            throw new Error("Client must be logged into its Discord account to perform this action.");
        await this.setupCommands();
        await this.setupCallers();
        this.userInteractions.on(this.userInteractions.events.ACCEPTED_MESSAGE, (...args) => this.handlerSentMessage(...args));
        this.userInteractions.on(this.userInteractions.events.ACCEPTED_REACTION, (...args) => this.handlerSentReaction(...args));
        this.userInteractions.on(this.userInteractions.events.ACCEPTED_BUTTON, (...args) => this.handlerSentButton(...args));
        this.client.clientDiscord.on("messageCreate", msg => this.userInteractions.emit(this.userInteractions.events.SENT_MESSAGE, msg));
        this.client.clientDiscord.on("messageReactionAdd", (reaction, user) => this.userInteractions.emit(this.userInteractions.events.SENT_REACTION, reaction, user));
        this.client.clientDiscord.on("interactionCreate", (data) => {
            if (data.isButton()) this.userInteractions.emit(this.userInteractions.events.SENT_BUTTON, data);
        });

        this.userInteractions.on(this.userInteractions.events.REJECTED_BUTTON, console.log);

        return this;
    }

}

module.exports = CommandDiscord;
