"use strict";

const Action = require("../Action");

const {
    Channel,
    Message
} = require("../../../lib/node_modules/discord.js");

/**
 * @description Sends a Discord Message to a Discord Channel
 * @extends {Action}
 */

class postDiscordMessageAction extends Action {

    /**
     * @param {string|number|BigInt|Channel} channel The channel object or the stringified identification number of the channel
     * @param {Object} contents The message object
     * @returns {?Promise<Message>} The message that was posted
     */

    async handle(channel, contents) {
        return this.client.settings.SEND_MESSAGES
        ? new Promise(async (res, rej) => {
            try {
                if (!(channel instanceof Channel))
                    channel = await this.client.clientDiscord.channels.fetch(`${channel}`);
                const msg = await channel.send(contents);
                res(msg);
            } catch (err) { rej(err); }
        })
        : null;
    }

}

module.exports = postDiscordMessageAction;
