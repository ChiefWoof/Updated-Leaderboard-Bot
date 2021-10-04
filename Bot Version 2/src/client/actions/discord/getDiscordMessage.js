"use strict";

const Action = require("../Action");

const { Message } = require("../../../lib/node_modules/discord.js");

/**
 * @description Retrives a Discord message from a Discord channel
 * @extends {Action}
 */

class getDiscordMessageAction extends Action {

    /**
     * @param {string} channelID the stringified identification number of the channel
     * @param {string} messageID the stringified identification number of the messages
     * @returns {Promise<Message>}
     */

    async handle(channelID, messageID) {
        return new Promise(async (res, rej) => {
            try {
                const channel = await this.client.clientDiscord.channels.fetch(channelID);
                const msg = await channel.messages.fetch(messageID);
                res(msg);
            } catch (err) { rej(err); }
        })
    }

}

module.exports = getDiscordMessageAction;
