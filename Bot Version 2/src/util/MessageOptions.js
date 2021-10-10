"use strict";

const {
    MessageActionRow,
    MessageEmbed,
    MessageFlags,
    MessageButton
} = require("discord.js");

/**
 * @description A class to simply creating properties of a message
 */

class MessageOptions {

    /**
     * @param {Object} data
     * @param {string} [data.content] Message text
     * @param {MessageEmbed[]} [data.embeds] Embedded messages
     * @param {MessageActionRow[]} [data.components] Components added to the message
     * @param {MessageFlags} [data.flags] Message bit flags
     */

    constructor(data) { this.build(data); }

    /**
     * @param {Object} data
     * @param {string} [data.content] Message text
     * @param {MessageEmbed[]} [data.embeds] Embedded messages
     * @param {MessageActionRow[]} [data.components] Components added to the message
     * @param {MessageFlags} [data.flags] Message bit flags
     */

    build(data={}) {

        /**
         * @description The message text
         * @type {MessageFlags}
         */

        this.flags = undefined;

        /**
         * @description The message text
         * @type {?string}
         */

        this.content = null;

        /**
         * @description The message text
         * @type {MessageEmbed[]}
         */

        this.embeds = [];

        /**
         * @description The message text
         * @type {MessageActionRow[]}
         */

        this.components = [];

        if ("flags" in data) this.flags = new MessageFlags(data.flags);
        if ("content" in data) this.content = data.content;
        if ("embeds" in data) this.addEmbeds(...data.embeds);
        if ("components" in data) this.addActionRows(...data.components);
    }

    /**
     * @param {...MessageEmbed} entries
     */

    addEmbeds(...entries) {
        entries.forEach(a => {
            this.embeds.push(this.createEmbed(a));
        });
        return this;
    }

    /**
     * @param {...MessageActionRow|MessageButton} entries
     */

    addActionRows(...entries) {
        let data = entries.reduce((v, a) => {
            if (a instanceof MessageButton) v.buttons.push(a);
            if (a instanceof MessageActionRow) v.rows.push(a);
            return v;
        }, {
            rows: [],
            buttons: []
        });
        
        if (data.buttons.length !== 0)
            data.rows.push(this.createActionRow(...data.buttons));

        this.components.push(...data.rows);
        return this;
    }

    /**
     * @description Sets all properties to be undefined
     */

    clear() {
        this.flags = undefined;
        this.content = undefined;
        this.embeds = undefined;
        this.components = undefined;
        return this;
    }

    /**
     * @description Creates an embedded message
     * @param {?MessageEmbed} entry
     * @returns {MessageEmbed}
     */

    createEmbed(entry) { return MessageOptions.createEmbed(entry); }

    /**
     * @description Creates a message action row
     * @param {?...MessageButton} entries
     * @returns {MessageActionRow}
     */

    createActionRow(...entries) { return MessageOptions.createActionRow(...entries); }

    /**
     * @description Creates a message button component
     * @param {?MessageButton} entry
     * @returns {MessageButton}
     */

    createButton(entry) { return MessageOptions.createButton(entry); }

}

/**
 * @description Creates an embedded message
 * @param {?MessageEmbed} entry
 * @returns {MessageEmbed}
 */

MessageOptions.createEmbed = function(entry) {
    return entry instanceof MessageEmbed
    ? entry
    : new MessageEmbed(entry);
}

/**
 * @description Creates a message action row
 * @param {?...MessageButton} entry
 * @returns {MessageActionRow}
 */

MessageOptions.createActionRow = function(...entries) {
    if (entries.length > 3)
        throw new Error("Maximum buttons per row is 3");
    return new MessageActionRow({
        components: entries.reduce((v, a) => {
            v.push(MessageOptions.createButton(a));
            return v;
        }, [])
    });
}

/**
 * @description Creates a message button component
 * @param {?MessageButton} entry
 * @returns {MessageButton}
 */

MessageOptions.createButton = function(entry) {
    return entry instanceof MessageButton
    ? entry
    : new MessageButton(entry);
}

module.exports = MessageOptions;