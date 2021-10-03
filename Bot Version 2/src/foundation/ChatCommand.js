"use strict";

/**
 * @description An advanced way of decoding a command string
 */

class ChatCommand {

    /**
     * @constructor
     * @param {Object} [options={}]
     * @param {(string | RegExp)[]} [options.prefixes=[]] Prefixes to start the command string with
     * @param {(string | RegExp)[]} [options.callers=[]] Callers that denote the command to use
     * @param {(string | RegExp)[]} [options.flags] Key words to be flagged when used
     * @param {?string} [str=null] 
     */

    constructor(options={}, str=null) {

        if (typeof options === "string") {
            str = options;
            options = undefined;
        }

        this.build();
        this.resolve(str, { prefixes: options.prefixes, callers: options.callers, flags: options.flags });
    }

    build() {

        /**
         * @description The prefix used to begin the command
         * @type {?string}
         */

        this.prefix = null;

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
     * @returns {boolean} Whether a prefix was specified
     */

    get hasPrefix() { return this.prefix !== null; }

    /**
     * @returns {boolean} Whether a caller was specified
     */

    get hasCaller() { return this.caller !== null; }

    /**
     * @returns {boolean} Whether a caller was specified
     */

    get isFlagged() { return this.flagged.length !== 0; }

    /**
     * @returns {string} A string that combines the args with a single space between them
     */

    get argsString() { return this.args.join(" "); }

    /**
     * @returns {string} A string that combines the argsFiltered with a single space between them
     */

    get argsFilteredString() { return this.argsFiltered.join(" "); }
    
    /**
     * @description Determines if the instance has all of the entered flags
     * @param  {...(string | RegExp)} args 
     * @returns {boolean} Whether the instance contains all of the entered flags
     */

    hasFlags(...args) {
        return args.every(f => this.flagged.some(a => f instanceof RegExp ? f.test(a) : f === a));
    }
    
    /**
     * @description Determines if the instance has all of the entered args
     * @param  {...(string | RegExp)} args 
     * @returns {boolean} Whether the instance contains all of the entered args
     */

    hasArgs(...args) {
        return args.every(f => this.args.some(a => f instanceof RegExp ? f.test(a) : f === a));
    }
    
    /**
     * @description Determines if the instance has all of the entered args in the filtered args
     * @param  {...(string | RegExp)} args 
     * @returns {boolean} Whether the instance contains all of the entered args in the filtered args
     */

    hasArgsFiltered(...args) {
        return args.every(f => this.argsFiltered.some(a => f instanceof RegExp ? f.test(a) : f === a));
    }
    
    /**
     * @description Determines if the instance has all of the entered users
     * @param  {...(string | RegExp)} args 
     * @returns {boolean} Whether the instance contains all of the entered users
     */

    hasMentionedUsers(...args) {
        return args.every(f => this.mentionedUsers.some(a => f instanceof RegExp ? f.test(a) : f === a));
    }
    
    /**
     * @description Determines if the instance has all of the entered roles
     * @param  {...(string | RegExp)} args 
     * @returns {boolean} Whether the instance contains all of the entered roles
     */

    hasMentionedRoles(...args) {
        return args.every(f => this.mentionedRoles.some(a => f instanceof RegExp ? f.test(a) : f === a));
    }
    
    /**
     * @description Determines if the instance has all of the entered channels
     * @param  {...(string | RegExp)} args 
     * @returns {boolean} Whether the instance contains all of the entered channels
     */

    hasMentionedChannels(...args) {
        return args.every(f => this.mentionedChannels.some(a => f instanceof RegExp ? f.test(a) : f === a));
    }

    /**
     * @description Setups the instance based on the entered string
     * @param {*} str 
     * @param {Object} [options]
     * @param {(string | RegExp)[]} [options.prefixes=[]] Prefixes to start the command string with
     * @param {(string | RegExp)[]} [options.callers=[]] Callers that denote the command to use
     * @param {(string | RegExp)[]} [options.flags=[]] Certain words to flag
     */

    resolve(str, { prefixes=[], callers=[], flags=[] }={}) {
        if (typeof str === "string") {

            this.prefix = prefixes.reduce((v, f) => {
                if (v) return v;

                if (f instanceof RegExp) {
                    if (f.test(str)) v = str.match(f)[0];
                } else if (str.startsWith(f)) {
                    v = f;
                }

                if (v) {
                    str = str.substr(v.length);
                }

                return v;
            }, null);

            str = str.replace(/^ {0,}/, "");

            this.caller = callers.reduce((v, f) => {
                if (v) return v;

                if (f instanceof RegExp) {
                    if (f.test(str)) v = str.match(f)[0];
                } else if (str.startsWith(f)) {
                    v = f;
                }

                if (v) {
                    str = str.substr(v.length);
                }

                return v;
            }, null);

            str = str.replace(/^ {0,1}/, "");
            this.args = str.split(" ");

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
ChatCommand.DISCORD_MENTION_ROLE_REGEX = /^(@&\d{1,}|<@&\d{1,}>)$/;
ChatCommand.DISCORD_MENTION_CHANNEL_REGEX = /^(#\d{1,}|<#\d{1,}>)$/;

module.exports = ChatCommand;
