"use strict";

const Client = require("../client/ClientDiscord");
const Util = require("../util/Util");

const UserStatusBot = require("../util/UserStatusBot");
const UserStatusUL = require("../util/UserStatusUL");
const UserStatusGD = require("../util/UserStatusGD");

const ChatCommandMessage = require("./ChatCommandMessage");
const ChatCommand = require("./ChatCommand");

const InteractionManager = require("../managers/InteractionManager");
const UserInteractionOptions = require("../util/UserInteractions");

const CallbackManager = require("../managers/CallbackManager");
const CommandCallersManager = require("../managers/CommandCallersManager");

const {
    GuildMember,
    Message,
    User,
    MessageReaction,
    ButtonInteraction
} = require("../lib/node_modules/discord.js/");

class CommandDiscord {

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

        /**
         * @description The client
         * @type {InteractionManager}
         */

        this.userInteractions = new InteractionManager(undefined, {
            sentMessageCondition: (...args) => this.handlerSentMessageCondition.call(this, ...args),
            sentReactionCondition: (...args) => this.handlerSentReactionCondition.call(this, ...args),
            sentButtonCondition: (...args) => this.handlerSentButtonCondition.call(this, ...args),
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

    async hasPermissionUse({
        statusBot = new UserStatusBot(),
        statusUL = new UserStatusUL(),
        statusGD = new UserStatusGD(),
    }={}) {
        return statusBot.has(this.constructor.STATUS_BOT)
        && statusUL.has(this.constructor.STATUS_UL)
        && statusGD.has(this.constructor.STATUS_GD);
    }

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
        return this;
    }

    /**
     * @async
     * @description Setups the subcommand callers
     */

    async setupCallers() {
        this.callers.clear();
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
     * @param {Message} data 
     * @returns {boolean}
     */

    handlerSentMessageCondition(data) {
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
     * @param {Message} data
     */

    handlerSentMessage(data) {
        let msgCmd = new ChatCommandMessage(data);
        msgCmd.handler({ callers: this.callers.callersRegexDiscord });
        
        if (msgCmd.command.hasCaller) {
            let cmdID = this.callers.findCommandIDByIndex(msgCmd.command.caller);
            if (this.commands.has(`${cmdID}`)) this.commands.get(`${cmdID}`).callback();
        }

        return this;
    }

    /**
     * @param {MessageReaction} reaction 
     * @param {User} user 
     * @returns {boolean}
     */

    handlerSentReactionCondition(reaction, user) { return false; }

    /**
     * @param {MessageReaction} reaction 
     * @param {User} user 
     */

    handlerSentReaction(reaction, user) { return this; }

    /**
     * @param {ButtonInteraction} data 
     * @returns {boolean}
     */

    handlerSentButtonCondition(data) { return false; }

    /**
     * @param {ButtonInteraction} data
     */

    handlerSentButton(data) { return this; }

    /**
     * @description Starts running client-user interactions
     */

    runInteractions() {
        if (!this.client.loggedIn)
            throw new Error("Client must be logged into its Discord account to perform this action.");
        this.setupCommands();
        this.setupCallers();
        this.userInteractions.on(this.userInteractions.events.ACCEPTED_MESSAGE, (...args) => this.handlerSentMessage(...args));
        this.userInteractions.on(this.userInteractions.events.ACCEPTED_REACTION, (...args) => this.handlerSentReaction(...args));
        this.userInteractions.on(this.userInteractions.events.ACCEPTED_BUTTON, (...args) => this.handlerSentButton(...args));
        this.client.clientDiscord.on("messageCreate", msg => this.userInteractions.emit(this.userInteractions.events.SENT_MESSAGE, msg));
        this.client.clientDiscord.on("messageReactionAdd", (reaction, user) => this.userInteractions.emit(this.userInteractions.events.SENT_REACTION, reaction, user));
        return this;
    }

}

module.exports = CommandDiscord;
