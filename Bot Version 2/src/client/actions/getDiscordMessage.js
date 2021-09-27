"use strict";

const Action = require("../Action");

const { Message } = require("../../../lib/node_modules/discord.js");

/**
 * @description Deletes an account from the gdAccounts cache
 * @extends {Action}
 */

class getDiscordMessageAction extends Action {

    /**
     * @param {string} channelID the stringified identification number of the channel
     * @param {string} messageID the stringified identification number of the messages
     * @returns {?Message}
     */

    async handle(channelID, messageID) {
        let c = await this.client.clientDiscord.channels.fetch(channelID);
        return await c.messages.fetch(messageID);
    }

}

module.exports = getDiscordMessageAction;
