"use strict";

/**
 * @description An advanced way of decoding a command string
 */

class ChatCommand {

    /**
     * @constructor
     * @param {Object} [options={}]
     * @param {(string | RegExp)[]} [options.flags] Key words to be flagged when used
     * @param {?string} [str=null] 
     */

    constructor(options={}, str=null) {

        if (typeof options === "string") {
            str = options;
            options = undefined;
        }

        this.build(options);
        this.resolve(str, options.flags);
    }

    build(options={}) {

        /**
         * @description The name of the command to use
         * @type {?string}
         */

        this.caller = null;

        /**
         * @description The command arguments in string form
         * @type {string[]}
         */

        this.args = [];

        /**
         * @description Arguments that were flagged
         * @type {string[]}
         */

        this.flagged = [];

        /**
         * @description The command arguments in string form that were not flagged
         * @type {string[]}
         */

        this.argsFiltered = [];

        /**
         * @description Users mentioned in the command string
         * @type {string[]}
         */

        this.mentionedUsers = [];

        /**
         * @description Roles mentioned in the command string
         * @type {string[]}
         */

        this.mentionedRoles = [];

        /**
         * @description Channels mentioned in the command string
         * @type {string[]}
         */

        this.mentionedChannels = [];

        return this;
    }

    /**
     * @description Setups the instance based on the entered string
     * @param {*} str 
     * @param {(string | RegExp)[]} [flags=[]] Certain words to flag
     */

    resolve(str, flags=[]) {
        if (typeof str === "string") {
            str = str.replace(/^ {0,}/, "").split(" ");

            this.caller = str[0] || null;
            this.args = str.slice(1);

            let data = this.args.reduce((v, a) => {
                if (!(v.flagged.includes(a) || flags.findIndex(f => f instanceof RegExp ? f.test(a) : f === a) === -1))
                    v.flagged.push(a);
                else if (ChatCommand.DISCORD_MENTION_USER_REGEX.test(a))
                    v.mentionedUsers.push(a.match(/\d{1,}/)[0]);
                else if (ChatCommand.DISCORD_MENTION_ROLE_REGEX.test(a))
                    v.mentionedRoles.push(a.match(/\d{1,}/)[0]);
                else if (ChatCommand.DISCORD_MENTION_CHANNEL_REGEX.test(a))
                    v.mentionedChannels.push(a.match(/\d{1,}/)[0]);
                else
                    v.argsFiltered.push(a);
                return v;
            }, {
                flagged: [],
                argsFiltered: [],
                mentionedUsers: [],
                mentionedRoles: [],
                mentionedChannels: []
            });

            this.flagged = data.flagged;
            this.argsFiltered = data.argsFiltered;
            this.mentionedUsers = data.mentionedUsers;
            this.mentionedRoles = data.mentionedRoles;
            this.mentionedChannels = data.mentionedChannels;

        }
        return this;
    }

}

ChatCommand.DISCORD_MENTION_USER_REGEX = /^(@\d{1,}|<@\d{1,}>)$/;
ChatCommand.DISCORD_MENTION_ROLE_REGEX = /^(#\d{1,}|<#\d{1,}>)$/;
ChatCommand.DISCORD_MENTION_CHANNEL_REGEX = /^(@&\d{1,}|<@&\d{1,}>)$/;

module.exports = ChatCommand;
