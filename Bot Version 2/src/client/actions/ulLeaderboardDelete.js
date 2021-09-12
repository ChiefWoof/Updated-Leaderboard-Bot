"use strict";

const Action = require("./Action");
const UserOnLeaderboard = require("../../foundation/UserOnLeaderboard");
const { Client: { events } } = require("../../util/Constants");

/**
 * @description Deletes an account from the ulAccounts cache
 * @extends {Action}
 */

class ulLeaderboardDeleteAction extends Action {

    /**
     * @param {UserOnLeaderboard} entry
     */

    handle(entry) {
        if (!entry) return;
        if (this.client.ulLeaderboard.deleteEntry(entry))
            this.client.emit(events.UL_LEADERBOARD_DELETE, entry);
    }

}

module.exports = ulLeaderboardDeleteAction;